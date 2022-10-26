// This is where the logic for the automated writing of contracts will go
import dotenv from 'dotenv';
dotenv.config();

const bs = require("black-scholes");

import { getAssetById } from "../models/assetModel";
import { createContract } from "../models/contractModel";
import { getActiveContractTypesByAssetId, getContractTypeById } from "../models/contractTypeModel";
import { getUnlockedAmountByAssetId } from "../models/poolModel";
import { getAssetPrice } from "../prices/getPrices";
import { Contract } from "../types";

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

export async function createOptionsChain(assetId: number) {
  const asset = await getAssetById(assetId);
  const assetPrice = 20000; // DEBUG, TODO: Delete for production
  // const assetPrice = await getAssetPrice(asset.assetId, asset.assetType); // TODO: Uncomment for production price API results
  let unlockedAmount = await getUnlockedAmountByAssetId(assetId);
  const contractTypes = await getActiveContractTypesByAssetId(assetId);
  for (let contractType of contractTypes) {
    let timeToExpiry = (new Date(contractType.expiresAt).getTime() - Date.now()) / 31556926000;
    let askPrice = Math.trunc(bs.blackScholes(
      assetPrice, // s - Current price of the underlying
      contractType.strikePrice, // k - Strike price
      timeToExpiry, // t - Time to expiration in years
      .2, // TODO: Define v - Volatility as a decimal
      0.0, // TODO: Define r - Annual risk-free interest rate as a decimal
      contractType.direction ? 'call' : 'put' // callPut - The type of option to be priced - "call" or "put"
    ) * 100) / 100;
    // console.log('askPrice', askPrice);
    // console.log('Actual cost', askPrice * contractType.assetAmount);
    // This will create as many contracts as possible with the unlocked pools
    // Does not account for any type of weights, just does a uniform distribution
    // Works best under the assumption contractType.assetAmount will be consistent across contractTypes (which it should be)
    // TODO: This currently leads to some unlocked amounts due to needing a uniform distribution across all types
    // Fix this to allow partial distributions
    for (let i = 0; i < Math.floor(unlockedAmount / (contractType.assetAmount * contractTypes.length)); i++) {
      const contract = await createContract(
        contractType.contractTypeId,
        askPrice
      );
      console.log(contract);
    }
  }
}

// TEST
// createOptionsChain(1);
