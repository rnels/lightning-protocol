// Controller for retrieving volatility for provided asset
import dotenv from 'dotenv'; // DEBUG - Only need when running file standalone
dotenv.config(); // DEBUG - Only need when running file standalone

import { Asset } from '../types';
import {
  getAssetById,
  _createAssetPriceHistoryIfNotExists,
  getAssetPriceHistoryByAssetIdLimit
} from '../models/assetModel';

// NOTE: Known crypto asset Symbols (CC):
  // Bitcoin - BTC
  // Ethereum - ETH

// Outputs the volatility in percentage from avg. price (%) for an array of prices
// Split into groups defined by window in order to get multiple averages
// TODO: Average it out further by introducing weights for recency
// TODO: Make sure the group vol actually does anything
function _getPriceVolatilityFromPrices(prices: number[], window=14): number {
  if (window > prices.length) { window = prices.length; } // Safety in case it's passed less than the window prices
  const getGroupVol = (priceGroup: number[]) => {
    let priceSum = priceGroup.reduce((sum, a) => sum + a, 0);
    let priceAvg = priceSum / priceGroup.length;
    let squaredArr: number[] = [];
    for (let price of priceGroup) {
      let dif = price - priceAvg;
      squaredArr.push(Math.pow(dif, 2));
    }
    let squaredSum = squaredArr.reduce((sum, a) => sum + a, 0);
    let variance = squaredSum / priceGroup.length;
    let stdev = Math.sqrt(variance);
    let groupVolatility = stdev / priceAvg;
    // console.log('groupVolatility', groupVolatility); // DEBUG
    return groupVolatility;
  }
  let groupsArray: number[] = [];
  for (let i = 0; i < prices.length; i+=window) {
    groupsArray.push(getGroupVol(prices.slice(i, i + window)));
  }
  let volatilitySum = groupsArray.reduce((sum, a) => sum + a, 0); // Get sum of group volatility
  let volatility = volatilitySum / groupsArray.length; // Get average volatility
  // console.log('volatility:', volatility); // DEBUG
  return volatility;
}

// Get a decimal representing a price volatility for the provided asset from historical prices
// Doesn't make an API call to update historical volatility
export async function getAssetPriceVolatility(asset: Asset, lookback=365, window=14): Promise<number> {
  // TODO: create conditionals for the different assetTypes
  let res = await getAssetPriceHistoryByAssetIdLimit(asset.assetId, lookback);
  let dbPrices = res.map((e) => parseFloat(e.price as string));
  let decimalVolatility = _getPriceVolatilityFromPrices(dbPrices, window);
  return decimalVolatility;
}

// TEST
(async () => {
  let testAsset = await getAssetById(1);
  let vol = await getAssetPriceVolatility(testAsset);
  console.log('getAssetPriceVolatilityDebug volatility:', vol);
});
