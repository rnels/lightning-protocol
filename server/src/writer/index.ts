// This is where the logic for the automated writing of contracts will go
// The supply is artificial, the demand is not
import dotenv from 'dotenv'; // DEBUG
dotenv.config(); // DEBUG

const bs = require("black-scholes");

import { getAccountInfoById } from '../models/accountModel';
import { getAssetById, getAssetPriceById } from "../models/assetModel";
import { createBid, getBidsByContractTypeAndAccountId, updateBidPrice } from '../models/bidModel';
import { createContract, getActiveContractsByTypeId, _writerGetContractsByTypeId, _writerUpdateAskPrice } from "../models/contractModel";
import { createContractType, getActiveContractTypesByAssetId, getContractTypeById } from "../models/contractTypeModel";
import { getUnlockedAmountByAssetId } from "../models/poolModel";
import { getAssetPriceFromAPI } from "../assets/price";
import { getAssetPriceVolatility, getAssetPriceVolatilityDebug } from '../assets/volatility';
import { Asset } from '../types';
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

  // NOTE: Technically, volatility will be constant across strikePrices so you could pass this as an argument instead since you'll be getting the same volatility across all strikes ... but it looks neater here
// TODO: Consider whether I want to pass assetPrice as an arg instead, seeing as there are repeated calls for it when this is called in succession, but it will (should) be unchanging between calls
// TODO: For future prices, use IV instead of HV based on activity (?)
async function _getBSPrice(asset: Asset, strikePrice: number, expiresAt: Date, direction: boolean, assetPrice?: number) {
  // console.log('expiresAt:', expiresAt); // DEBUG
  let timeToExpiry = _getTimeToExpiryFromExpiresAt(expiresAt);
  // console.log('timeToExpiry:', timeToExpiry); // DEBUG
  let window = Math.ceil(timeToExpiry * 365);
  // console.log('window:', window); // DEBUG
  if (!assetPrice) { assetPrice = await getAssetPriceById(asset.assetId); }
  // let volatility = await getAssetPriceVolatility(asset, assetPrice, 365, window); // TODO: Uncomment for production volatility results
  let volatility = await getAssetPriceVolatilityDebug(asset, assetPrice, 365, window);  // DEBUG, TODO: Delete for production
  // let volatility = 0.611;  // EXTRA DEBUG
  // console.log('volatility:', volatility); // DEBUG
  return Math.trunc(bs.blackScholes(
    assetPrice, // s - Current price of the underlying
    strikePrice, // k - Strike price
    timeToExpiry, // t - Time to expiration in years
    volatility, // v - Volatility as a decimal
    0, // TODO: Define r - Annual risk-free interest rate as a decimal
    direction ? 'call' : 'put' // callPut - The type of option to be priced - "call" or "put"
  ) * 100) / 100;
}

function _getTimeToExpiryFromExpiresAt(expiresAt: Date) {
  return (expiresAt.getTime() - Date.now()) / 31556926000; // NOTE: Uses intersection between leap year and non-leap year time iirc
}

/** Represents how much a contract is being traded relative to the number of outstanding contracts. Should be used in the formula determining which contractTypes to be writing more of */
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
export async function createContractTypeChain(assetId: number) {
  const asset = await getAssetById(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(assetId);
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
  if (contractTypes.length) { // If contractTypes exist
    // TODO: Flesh this part out, it should achieve the second goal of the function
    let ratios = [];
    for (let contractType of contractTypes) {
      let ratio = await _getVolumeOIRatio(contractType.contractTypeId);
      ratio && ratios.push(ratio);
      // TODO ...
    }
    let ratioSum = ratios.reduce((sum, a) => sum + a, 0);
    let ratioAvg = ratioSum / ratios.length;
    // console.log(ratioAvg); // DEBUG
    // TODO ...
  } else { // If contractTypes do not exist
    // TODO: Have the contracts expire at the same time every time
    // TODO: Keep in mind that daysOut affects the the price volatility (and BS model pricing),
    // So if I'm always creating the contracts at a fixed interval, it would be good to base everything around that interval
    let daysOut = 8 * 7; // 8 weeks / 56 days
    let expiresAt = new Date(Date.now());
    expiresAt.setDate(expiresAt.getDate() + daysOut);
    // console.log('expiresAt:', expiresAt); // DEBUG
    // Get historical volatility, use to generate a standard deviation from current price
    // Each standard deviation represents 1 strike price in either direction
    let assetPriceRounded = Math.trunc(assetPrice / roundMultiplier) * roundMultiplier;
    // let volatility = 0.5; // DEBUG
    // let volatility = await getAssetPriceVolatility(asset, assetPrice, 365, daysOut); // TODO: Uncomment for production
    let volatility = await getAssetPriceVolatilityDebug(asset, assetPriceRounded, 365, daysOut); // DEBUG: Remove for production
    // console.log('volatility:', volatility); // DEBUG
    let deviation = Math.trunc((assetPriceRounded * volatility) / roundMultiplier) * roundMultiplier;
    let stepMultiplier = 5; // NOTE: Increasing this decreases the amount of standard deviations in the chain
    let deviationStep = deviation / stepMultiplier;
    // console.log('deviation:', deviation); // DEBUG
    let createContractTypePromises = [];
    // Creates (10 / stepMultiplier) standard deviations worth of contractTypes
    for (let i = 1; i <= 10; i++) {
      let strikePrices = {
        // Includes an initial offset of 5%
        call: assetPriceRounded + (deviationStep * i) + (assetPriceRounded * 0.05),
        put: assetPriceRounded - ((deviationStep * i) / 2) - (assetPriceRounded * 0.05) // Dividing by 2 on puts due to how the distribution works, will decide if this is the best way after some time
      };
      // console.log('strikePrices.call:', strikePrices.call); // DEBUG
      // console.log('strikePrices.put:', strikePrices.put); // DEBUG
      createContractTypePromises.push(
        createContractType(asset.assetId, true, strikePrices.call, expiresAt),
        strikePrices.put > 0 && createContractType(asset.assetId, false, strikePrices.put, expiresAt)
      );
    }
    await Promise.all(createContractTypePromises);
  }
}

export async function createContractsChain(assetId: number) {
  const asset = await getAssetById(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  let unlockedAmount = await getUnlockedAmountByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    let askPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction);
    // console.log('askPrice:', askPrice); // DEBUG
    // This will create as many contracts as possible with the unlocked pools
    // Does not account for any type of weights, just does a uniform distribution
    // Works best under the assumption asset.assetAmount will be consistent across contractTypes (which it should be)
    // TODO: This currently leads to some unlocked amounts due to needing a uniform distribution across all types
    // Fix this to allow partial distributions
    if (askPrice > 0) {
      for (let i = 0; i < Math.floor(unlockedAmount / (asset.assetAmount * contractTypes.length)); i++) {
        try { // TODO: Create better system of addressing this, partial distributions should help
          await createContract(
            contractType.contractTypeId,
            askPrice
          );
        } catch {}
      }
    }
  }
}

export async function automaticBidTest(assetId: number) {
  const asset = await getAssetById(assetId);
  const account = await getAccountInfoById(1);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    let bidPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction);
    // Creates 1 bid per contractType
    // TODO: Ensure that this account has "unlimited" paper
    let existingBids = await getBidsByContractTypeAndAccountId(contractType.contractTypeId, account.accountId);
    if (existingBids.length > 0) { // If bids already exist for this contract type, update them to the new price
      for (let bid of existingBids) {
        await updateBidPrice(bid.bidId, bidPrice, account.accountId);
      }
    } else { // If bid(s) do not already exist, create a new bid
      await createBid(
        contractType.contractTypeId,
        account.accountId,
        bidPrice
      );
    }
  }
}

export async function writerAskUpdate(assetId: number) {
  const asset = await getAssetById(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    let askPrice =  await _getBSPrice(asset, contractType.strikePrice, contractType.expiresAt, contractType.direction);
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
(async () => {
  let assetId = 1;
  // await createContractTypeChain(assetId);
  // await createContractsChain(assetId);
  // await automaticBidTest(assetId);
  // await writerAskUpdate(assetId);
})();
