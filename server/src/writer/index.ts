// This is where the logic for the automated writing of contracts will go
// The supply is artificial, the demand is not
import dotenv from 'dotenv'; // DEBUG
dotenv.config(); // DEBUG

const bs = require("black-scholes");

import { getAccountInfoById } from '../models/accountModel';
import { getAssetById } from "../models/assetModel";
import { createBid, getBidsByContractTypeAndAccountId, updateBidPrice } from '../models/bidModel';
import { createContract, _writerGetContractsByTypeId, _writerUpdateAskPrice } from "../models/contractModel";
import { getActiveContractTypesByAssetId, getContractTypeById } from "../models/contractTypeModel";
import { getUnlockedAmountByAssetId } from "../models/poolModel";
import { getAssetPrice } from "../assets/price";
import { getAssetPriceVolatility, getAssetPriceVolatilityNoAPI } from '../assets/volatility';

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

async function _getBSPrice(assetPrice: number, strikePrice: number, expiresAt: string, volatility: number, direction: boolean) {
  let timeToExpiry = (new Date(expiresAt).getTime() - Date.now()) / 31556926000; // TODO: Make this not so ugly
  return Math.trunc(bs.blackScholes(
    assetPrice, // s - Current price of the underlying
    strikePrice, // k - Strike price
    timeToExpiry, // t - Time to expiration in years
    volatility, // v - Volatility as a decimal
    0, // TODO: Define r - Annual risk-free interest rate as a decimal
    direction ? 'call' : 'put' // callPut - The type of option to be priced - "call" or "put"
  ) * 100) / 100;
}

export async function createContractsChain(assetId: number) {
  const asset = await getAssetById(assetId);
  const assetPrice = 20000; // DEBUG, TODO: Delete for production
  // const assetPrice = await getAssetPrice(asset.priceApiId, asset.assetType); // TODO: Uncomment for production price API results
  // const volatility = await getAssetPriceVolatility(asset, assetPrice, 365); // TODO: Uncomment for production volatility results
  const volatility = await getAssetPriceVolatilityNoAPI(asset, assetPrice, 365);
  const unlockedAmount = await getUnlockedAmountByAssetId(asset.assetId);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    let askPrice =  await _getBSPrice(assetPrice, contractType.strikePrice, contractType.expiresAt, volatility, contractType.direction);
    // console.log('askPrice', askPrice);
    // console.log('Actual cost', askPrice * asset.assetAmount);
    // This will create as many contracts as possible with the unlocked pools
    // Does not account for any type of weights, just does a uniform distribution
    // Works best under the assumption asset.assetAmount will be consistent across contractTypes (which it should be)
    // TODO: This currently leads to some unlocked amounts due to needing a uniform distribution across all types
    // Fix this to allow partial distributions
    for (let i = 0; i < Math.floor(unlockedAmount / (asset.assetAmount * contractTypes.length)); i++) {
      await createContract(
        contractType.contractTypeId,
        askPrice
      );
    }
  }
}

export async function automaticBidTest(assetId: number) {
  const asset = await getAssetById(assetId);
  const account = await getAccountInfoById(1);
  const assetPrice = 20000; // DEBUG, TODO: Delete for production
  // const assetPrice = await getAssetPrice(asset.priceApiId, asset.assetType); // TODO: Uncomment for production price API results
  // const volatility = await getAssetPriceVolatility(asset, assetPrice, 365); // TODO: Uncomment for production volatility results
  const volatility = await getAssetPriceVolatilityNoAPI(asset, assetPrice, 365);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    let bidPrice =  await _getBSPrice(assetPrice, contractType.strikePrice, contractType.expiresAt, volatility, contractType.direction);
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

export async function automaticAskUpdateTest(assetId: number) {
  const asset = await getAssetById(assetId);
  const assetPrice = 20295.8; // DEBUG, TODO: Delete for production
  // const assetPrice = await getAssetPrice(asset.priceApiId, asset.assetType); // TODO: Uncomment for production price API results
  // const volatility = await getAssetPriceVolatility(asset, assetPrice, 365); // TODO: Uncomment for production volatility results
  const volatility = await getAssetPriceVolatilityNoAPI(asset, assetPrice, 365);
  const contractTypes = await getActiveContractTypesByAssetId(asset.assetId);
  for (let contractType of contractTypes) {
    let askPrice =  await _getBSPrice(assetPrice, contractType.strikePrice, contractType.expiresAt, volatility, contractType.direction);
    // Updates ask price for each active contracts of the contractType
    let activeContracts = await _writerGetContractsByTypeId(contractType.contractTypeId);
    if (activeContracts.length > 0) {
      for (let contract of activeContracts) {
        await _writerUpdateAskPrice(contract.contractId, askPrice);
      }
    }
  }
}

// TEST
// createContractsChain(1);
// automaticBidTest(1);
// automaticAskUpdateTest(1);