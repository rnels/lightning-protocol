// This is where the logic for the automated writing of contracts will go
// The supply is artificial, the demand is not
import dotenv from 'dotenv'; // DEBUG - Only required when running file standalone
dotenv.config(); // DEBUG - Only required when running file standalone

const bs = require("black-scholes");

import { getAccountInfoById } from '../models/accountModel';
import { getAssetById, getAssetPriceById } from "../models/assetModel";
import { createBids, getBidsByContractTypeAndAccountId, updateBidPrice } from '../models/bidModel';
import { createContract, getActiveContractsByTypeId, _writerGetContractsByTypeId, _writerUpdateAskPrice } from "../models/contractModel";
import { createContractType, getActiveContractTypesByAssetId } from "../models/contractTypeModel";
import { getUnlockedAmountByAssetId } from "../models/poolModel";
import { getAssetPriceVolatility } from '../assets/volatility';
import { Asset, ContractType } from '../types';
import { getTradesWithin24HoursByTypeId } from '../models/tradeModel';

// Goals:
/**
 * 1. Determine fair pricing for contracts
 * 2. Allocate pool assets to contracts in a way that assures fair risk / reward to pool participants and options traders
 * 3. Allocate as much as possible from unlocked pools
*/

// Some considerations:
/**
 * Contracts can only be created using currently unlocked pool amounts.
 *
 * If it's expected to try and achieve 100% pool utilization, the pool locks should have a "cooldown" to avoid users being constantly locked out of withdrawal from their pool.
 *
 * The pricing of the options should follow the Black-Scholes model unless I want to go with another model that is tailored more towards American-style options. Also, Black-Scholes does not factor transaction costs in buying the option. Technically there is only a selling cost, but that cost could be factored in.
 * Other options: Binomial, Trinomial, Bjerksund-Stensland
 *
 * All options contracts are created a fixed time away from the date they are issued, let's say 2 months for now. Every week, another set of them is written. Need to ensure the time of writing and expiry is fixed and consistent, i.e. 3PM CST every Friday (though that is boring, copying traditional markets like that...)
*/

// TODO: Idea for changing the uniform distribution - Weigh it based on Volume / OI ratio, higher ratio = more contracts created. We want to normalize the Volume / OI ratio across contracts by introducing supply when it's higher than the average.
// Though do consider that this only works for looking at activity on a specific type of contract, which factors in the expiry date. For example if a contract expiring on 11/6 had a high ratio, I'd be forced to make more contracts for 11/13 due to the rolling period, which does not exactly translate. Though it does a bit I suppose, just lengthens the time value...
// Or maybe instead of a rolling period, I'm always issuing contracts for a 2 week (or month) expiry, and every day evaluating the volume / OI in determining which contracts to make more of. Though this only works if there's more pooling activity over time, people are exercising contracts to free up locks, etc. Which kind of works counterproductively to the goal of adding more contracts to the ones with higher activity since the OI will lower as they're exercised.
// It's possible that adding new contracts can work on two events: Pool locks freeing up (after a cooldown period) and new pools being created / added to. When a threshold is reached on the latter event to cover one new contract, a queue of contract types to create ranked on current ratio data is iterated through in the creation of contracts. This also keeps the process of creating contracts dynamic. For the former type, this can be the pool amount that's used for creating new types of contracts as time and market price progress, introducing new expiry dates and strike prices on a rolling basis. This can happen on a fixed schedule, such as every 2 weeks, which evaluates the current date and current asset price to create new types rather than looking at the Volume / OI ratio of existing contract types. Another thing I can look at in determining the former is whether there's a lot of activity on the top and bottom of the strike price spread, meaning that people are looking to buy for higher and lower strikes and so more contract types should be created
// For creating new contracts of an existing type with contracts being traded, look at bid / ask spread for determining price rather than using a financial model? It depends on how close models come to the traded price I suppose. Don't want to undersell them
// For simulating bidding activity, run the BS model function to get a bid price for the contract and have the AI bid on that using an actual account (that's made for the purpose of this, i.e. account_id 1). This should simulate real demand over time as the price of the underlying asset and time expiry changes

// TODO: For future prices, use IV instead of HV based on activity (?)
async function _getBSPrice(asset: Asset, strikePrice: number, expiresAt: string, direction: boolean, assetPrice?: number) {
  // console.log('expiresAt:', expiresAt); // DEBUG
  let timeToExpiry = _getTimeToExpiryFromExpiresAt(expiresAt);
  // console.log('timeToExpiry:', timeToExpiry); // DEBUG
  let window = Math.ceil(timeToExpiry * 365);
  // console.log('window:', window); // DEBUG
  if (!assetPrice) { assetPrice = await getAssetPriceById(asset.assetId); }
  let volatility = await getAssetPriceVolatility(asset, 365, window);
  // let volatility = 0.611;  // EXTRA DEBUG
  // console.log('volatility:', volatility); // DEBUG
  return Math.trunc(bs.blackScholes( // TODO: May have to use assetAmount as a multiplier if I do microcap coins(?)
    assetPrice, // s - Current price of the underlying
    strikePrice, // k - Strike price
    timeToExpiry, // t - Time to expiration in years
    volatility, // v - Volatility as a decimal
    0, // TODO: Define r - Annual risk-free interest rate as a decimal
    direction ? 'call' : 'put' // callPut - The type of option to be priced - "call" or "put"
  ) * 100) / 100;
}

function _getTimeToExpiryFromExpiresAt(expiresAt: string) {
  return (new Date(expiresAt).getTime() - Date.now()) / 31556926000; // NOTE: Uses intersection between leap year and non-leap year time iirc
}

/** Represents how much a contractType is being traded relative to the number of outstanding contracts. Should be used in the formula determining which contractTypes to be writing more of */
async function _getVolumeOIRatio(typeId: number) {
  const trades = await getTradesWithin24HoursByTypeId(typeId);
  const contracts = await getActiveContractsByTypeId(typeId);
  let volume = trades.length;
  let openInterest = contracts.length;
  if (openInterest === 0) return null;
  return volume / openInterest;
}

// Should be used for initial contractTypes of a new asset (will be called on creation of a new asset)
// Should also be used for determining new types of contracts to write for an existing asset, such as when the strike price spread should be increased or decreased based on current price
// TODO: Determine the fixed expiresAt time we want to use, because it will be fixed
// Start with 2 months(?)
// TODO: Use pg transactions
export async function writeContractTypeChain(assetId: number) {
  const asset = await getAssetById(assetId);
  asset.assetAmount = Number(asset.assetAmount);
  // TODO: Have the contracts expire at the same relative time every time
  // TODO: Keep in mind that daysOut affects the the price volatility (and BS model pricing),
  // So if I'm always creating the contracts at a fixed interval, it would be good to base everything around that interval
  let daysOut = 8 * 7; // 8 weeks / 56 days
  let expiresAt = new Date(Date.now());
  expiresAt.setUTCDate(expiresAt.getDate() + daysOut);
  expiresAt.setUTCHours(0, 0, 0, 0); // 7PM ET
  // console.log('expiresAt:', expiresAt); // DEBUG
  const existingContractTypes = await getActiveContractTypesByAssetId(assetId); // TODO: Change to only get contractTypes with expiry = expiresAt
  // let assetPrice = 1; // DEBUG
  let assetPrice = await getAssetPriceById(asset.assetId);
  let assetPriceString = assetPrice.toString();
  let wholePlaces = assetPriceString.slice(0, assetPriceString.indexOf('.')).length;
  let roundMultiplier = 1;
  if (assetPrice < 1) {
    let decimalSlice = assetPriceString.slice(assetPriceString.indexOf('.') + 1);
    for (let i = 0; i < decimalSlice.length; i++) {
      if (['1','2','3','4','5','6','7','8','9'].includes(decimalSlice[i])) {
        roundMultiplier = Math.pow(10, -(i+2));
        break;
      }
    }
  } else {
    roundMultiplier = Math.pow(10, wholePlaces - 2);
  }
  // console.log('roundMultiplier', roundMultiplier); // DEBUG
  // TODO: Change this to only check if contractTypes at the given expiry exist
  if (existingContractTypes.length) { // If contractTypes exist at the given expiry
    // TODO: Flesh this part out, it should achieve the second goal of the function
    let ratios = [];
    for (let contractType of existingContractTypes) {
      let ratio = await _getVolumeOIRatio(contractType.contractTypeId);
      ratio && ratios.push(ratio);
      // TODO ...
    }
    let ratioSum = ratios.reduce((sum, a) => sum + a, 0);
    let ratioAvg = ratioSum / ratios.length;
    // console.log(ratioAvg); // DEBUG
    // TODO ...
  } else { // If contractTypes do not exist
      // Get historical volatility, use to generate a standard deviation from current price
      // Each standard deviation represents 1 strike price in either direction
      // let volatility = 0.5; // DEBUG
      let volatility = await getAssetPriceVolatility(asset, 365, daysOut);
      // console.log('volatility:', volatility); // DEBUG
      let deviation = Math.trunc((assetPrice * volatility) / roundMultiplier) * roundMultiplier;
      let stepMultiplier = 5; // NOTE: Increasing this decreases the amount of standard deviations in the chain
      let deviationStep = deviation / stepMultiplier;
      // console.log('deviation:', deviation); // DEBUG
      let createContractTypePromises = [];
      // Creates (10 / stepMultiplier) standard deviations worth of contractTypes
      let assetPriceRounded = Math.round(assetPrice / roundMultiplier) * roundMultiplier;
      let assetPriceOffset = assetPriceRounded - assetPrice;
      let deviationOffset = Math.ceil(Math.abs(assetPriceOffset) / deviationStep);
      console.log('deviationOffset', deviationOffset); // DEBUG
      console.log('assetPrice', assetPrice); // DEBUG
      console.log('assetPriceRounded', assetPriceRounded); // DEBUG
      let unlockedAmount = await getUnlockedAmountByAssetId(asset.assetId);
      let contractsToCreate = Math.floor((0.75 * unlockedAmount) / asset.assetAmount); // Aim to lock 75% of unlocked amounts
      let callLimit = true;
      let putLimit = true;
      for (let i = 1; callLimit || putLimit; i++) {
        let strikePrices = {
          call: assetPriceRounded + (deviationStep * deviationOffset) + (deviationStep * i),
          // 5% offset for puts to avoid immediate reserves
          put: (assetPriceRounded * 0.95) - (deviationStep * deviationOffset) - ((deviationStep * i) / 2) // Dividing by 2 on puts due to how the distribution works, will decide if this is the best way after some time
        };
        // This is a really janky looking way of doing it but I was having trouble iterating through strikeprices
        let callAskPrice =  await _getBSPrice(asset, strikePrices.call, expiresAt.toString(), true, assetPrice);
        if ((callAskPrice * asset.assetAmount) >= 0.01) {
          createContractTypePromises.push(
            createContractType(asset.assetId, true, strikePrices.call, expiresAt)
          );
        } else { callLimit = false; }
        if (createContractTypePromises.length === contractsToCreate) { break; }
        let putAskPrice =  await _getBSPrice(asset, strikePrices.put, expiresAt.toString(), false, assetPrice);
        if ((putAskPrice * asset.assetAmount) >= 0.01) {
          createContractTypePromises.push(
            createContractType(asset.assetId, false, strikePrices.put, expiresAt)
          );
        } else { putLimit = false; }
        if (createContractTypePromises.length === contractsToCreate) { break; }
      }
      let createdContractTypes = await Promise.all(createContractTypePromises);
      console.log('contractsToCreate', contractsToCreate); // DEBUG
      return writeContractsForTypes(asset, createdContractTypes, assetPrice, unlockedAmount);
  }
}

/** To use when writing the next wave of contracts, uses 75% of unlocked amounts */
async function writeContractsForTypes(asset: Asset, contractTypes: ContractType[], assetPrice: number, unlockedAmount: number) {
  let contractsToCreate = Math.floor((0.75 * unlockedAmount) / Number(asset.assetAmount)); // Aim to lock 75% of unlocked amounts
  for (let i = 0; i < contractsToCreate; i++) {
    for (let type of contractTypes) {
      let askPrice =  await _getBSPrice(asset, Number(type.strikePrice), type.expiresAt, type.direction, assetPrice);
      try {
        await createContract(type.contractTypeId, askPrice); // NOTE: pg seems to get overwhelmed if I try to Promise.all these instead
        i++
      } catch {
        console.log(i, 'of', contractsToCreate, 'contracts created') // DEBUG
        return;
      }
      if (i === contractsToCreate) {
        console.log(i, 'of', contractsToCreate, 'contracts created') // DEBUG
        return;
      }
    }
  }
}

// Goes through and creates as many contracts as possible for contractTypes with no open interest
// TODO: Use historical trading data for contractTypes of the same qualities but sooner expiry to determine how many should be made of each type
// export async function initializeContracts(assetId: number) {
//   const asset = await getAssetById(assetId);
//   asset.assetAmount = Number(asset.assetAmount);
//   const assetPrice = await getAssetPriceById(assetId);
//   const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
//   let unlockedAmount = await getUnlockedAmountByAssetId(asset.assetId);
//   for (let contractType of contractTypes) {
//     contractType.strikePrice = Number(contractType.strikePrice);
//     let contracts = await getActiveContractsByTypeId(contractType.contractTypeId);
//     let openInterest = contracts.length;
//     if (!openInterest) {
//       let askPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction, assetPrice);
//       // console.log('askPrice:', askPrice); // DEBUG
//       // This will create as many contracts as possible with the unlocked pools
//       // Does not account for any type of weights, just does a uniform distribution
//       // TODO: This currently leads to some unlocked amounts due to needing a uniform distribution across all types
//       // Fix this to allow partial distributions
//       if ((askPrice * asset.assetAmount) >= 0.01) {
//         for (let i = 0; i < Math.floor(unlockedAmount / (asset.assetAmount * contractTypes.length)); i++) {
//           try {
//             await createContract(
//               contractType.contractTypeId,
//               askPrice
//             );
//           } catch {}
//         }
//       }
//     }
//   }
// }

// Goes through and creates as many contracts as possible for contractTypes with no open interest
// TODO: Use historical trading data for contractTypes of the same qualities but sooner expiry to determine how many should be made of each type, consolidate this with writeContracts
export async function initializeContracts(assetId: number) {
  const asset = await getAssetById(assetId);
  asset.assetAmount = Number(asset.assetAmount);
  const assetPrice = await getAssetPriceById(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  let unlockedAmount = await getUnlockedAmountByAssetId(asset.assetId);
  let contractsToCreate = Math.floor((0.75 * unlockedAmount) / asset.assetAmount); // Aim to lock 75% of unlocked amounts
  let contractLimit = 0;
  // Keep looping while there are still unlockedAmounts
  while (contractLimit < contractsToCreate) {
    for (let contractType of contractTypes) {
      contractType.strikePrice = Number(contractType.strikePrice);
      let askPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction, assetPrice);
      // console.log('askPrice:', askPrice); // DEBUG
      // This will create as many contracts as possible with the unlocked pools
      // Does not account for any type of weights, just does a uniform distribution
      // TODO: This currently leads to some unlocked amounts due to needing a uniform distribution across all types
      // Fix this to allow partial distributions
      if ((askPrice * asset.assetAmount) >= 0.01) {
        try {
          // If there are not enough assets to create another contract, return
          await createContract(
            contractType.contractTypeId,
            askPrice
          );
          contractLimit++;
        } catch {
          console.log('Contract creation limit reached at', contractLimit, 'of', contractsToCreate); // DEBUG
          return;
        }
      }
    }
  }
  console.log('Contract creation limit reached at', contractLimit, 'of', contractsToCreate); // DEBUG
}

// Goes through and creates as many contracts as possible for contract types with trading history, amount created relative to OI ratio
// TODO: Make sure I'm not maxing out the pools in a way where the writer can't create new contract types
// due to being locked up (though could mitigate this by ensuring that new chains are created on expiry of old ones)

// TODO: Consolidate this with writeContractTypeChain, instead of writing contracts for existing types, create them for the newly created wave of types using the historical data of the existing types
// Consideration: New types may have different strike prices, will need to shift the window of historical data and interpolate where needed
export async function writeContracts(assetId: number) {
  const asset = await getAssetById(assetId);
  asset.assetAmount = Number(asset.assetAmount);
  const assetPrice = await getAssetPriceById(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  let unlockedAmount = await getUnlockedAmountByAssetId(asset.assetId);
  let contractsToCreate = Math.floor((0.75 * unlockedAmount) / asset.assetAmount); // Aim to lock 75% of unlocked amounts
  console.log('contractsToCreate:', contractsToCreate); // DEBUG
  let typeRatios: {
    contractType: ContractType,
    askPrice: number,
    ratio: number
  } [] = [];
  for (let contractType of contractTypes) {
    contractType.strikePrice = Number(contractType.strikePrice);
    if ( // Don't create contracts of ITM contract types
      contractType.strikePrice > assetPrice && contractType.direction || // OTM call
      contractType.strikePrice < assetPrice && !contractType.direction // OTM put
    ) {
      let askPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction, assetPrice);
      // console.log('askPrice:', askPrice); // DEBUG
      if ((askPrice * asset.assetAmount) >= 0.01) {
        let ratio = await _getVolumeOIRatio(contractType.contractTypeId);
        // console.log(ratio);
        ratio && typeRatios.push({
          contractType,
          askPrice,
          ratio
        });
      }
    }
  }
  if (!typeRatios.length) return; // If there's no contract types that are eligible to write for
  let ratioSum = typeRatios.reduce((sum, a) => sum + a.ratio, 0);
  let count = 0;
  for (let tr of typeRatios) {
    let ct = tr.contractType;
    let createAmount = Math.floor(contractsToCreate * (tr.ratio / ratioSum));
    console.log('createAmount:', createAmount); // DEBUG
    try {
      for (let i = 0; i < createAmount; i++) {
          await createContract(
            ct.contractTypeId,
            tr.askPrice
          );
          count++; // DEBUG
      }
    } catch {
      break; // If unable to create a contract, presumed due to hitting unlockedAmount limit, stop creating them
    }
  }
  console.log('Contract creation limit reached at count ' + count + ' of ' + contractsToCreate); // DEBUG
}

export async function automaticBidTest(assetId: number) {
  const asset = await getAssetById(assetId);
  const account = await getAccountInfoById(1);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    contractType.strikePrice = Number(contractType.strikePrice);
    let bidPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction);
    // Creates 1 bid per contractType
    // TODO: Ensure that this account has "unlimited" paper
    let existingBids = await getBidsByContractTypeAndAccountId(contractType.contractTypeId, account.accountId);
    if (existingBids.length > 0) { // If bids already exist for this contract type, update them to the new price
      for (let bid of existingBids) {
        await updateBidPrice(bid.bidId, bidPrice, account.accountId);
      }
    } else { // If bid(s) do not already exist, create a new bid
      await createBids(
        contractType.contractTypeId,
        account.accountId,
        bidPrice
      );
    }
  }
}

export async function writerAskUpdate(assetId: number) {
  const asset = await getAssetById(assetId);
  const assetPrice = await getAssetPriceById(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    contractType.strikePrice = Number(contractType.strikePrice);
    let askPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction, assetPrice);
    // console.log('askPrice:', askPrice); // DEBUG
    // Updates ask price for each active contracts of the contractType
    let activeContracts = await _writerGetContractsByTypeId(contractType.contractTypeId);
    if (activeContracts.length > 0 && askPrice > 0) {
      for (let contract of activeContracts) {
        await _writerUpdateAskPrice(contract.contractId, askPrice);
      }
    }
  }
}

// TESTS

// General testing
(async () => {
  let assetId = 1;
  await writeContractTypeChain(assetId);
  // await writeContracts(assetId);
  // await automaticBidTest(assetId);
  // await writerAskUpdate(assetId);
});

// Concurrency testing
// Doesn't have any reservations about creating new contractTypes (expected)
// TODO: Create checks in createContractType to avoid duplicates of strike + expiry
(async () => {
  let assetId = 4;
  await Promise.all([
    writeContractTypeChain(assetId),
    writeContractTypeChain(assetId),
    writeContractTypeChain(assetId),
    writeContractTypeChain(assetId),
    writeContractTypeChain(assetId),
    writeContractTypeChain(assetId)
  ]);
});

(async () => {
  await Promise.all([
    writeContractTypeChain(3),
    writeContractTypeChain(4),
    writeContractTypeChain(6)
  ]);
});

(async () => {
  await Promise.all([
    writeContracts(3),
    writeContracts(4),
    writeContracts(6)
  ]);
});
