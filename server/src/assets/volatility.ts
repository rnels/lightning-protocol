// Controller for retrieving volatility for provided asset
// Utilizes CryptoCompare API for historical "closing price" data on crypto assets
import dotenv from 'dotenv'; // DEBUG - Only need when running file standalone
dotenv.config(); // DEBUG - Only need when running file standalone

import axios from 'axios';
import { Asset, AssetType } from '../types';
import {
  getAssetById,
  _createAssetPriceHistoryIfNotExists,
  _getAssetPriceHistoryByAssetId,
  _getAssetPriceHistoryByAssetIdLimit
} from '../models/assetModel';

// NOTE: Known crypto asset Symbols (CC):
  // Bitcoin - BTC
  // Ethereum - ETH

// Outputs the volatility in percentage from avg. price (%) for an array of prices
// Split into groups defined by window in order to get multiple averages
// TODO: Average it out further by introducing weights for recency
function _getPriceVolatilityFromPrices(prices: number[], window=14): number {
  if (window > prices.length) { window = prices.length; } // Safety in case it's passed less than the groupedBy prices
  let priceSum = prices.reduce((sum, a) => sum + a, 0);
  let priceAvg = priceSum / prices.length;
  const getGroupVol = (priceGroup: number[]) => {
    let squaredArr: number[] = [];
    for (let price of priceGroup) {
      let dif = price - priceAvg;
      squaredArr.push(Math.pow(dif, 2));
    }
    let squaredDif = squaredArr.reduce((sum, a) => sum + a, 0);
    let variance = squaredDif / priceGroup.length;
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
  return volatility;
}

function getCryptoPriceHistoricalDataFromAPI(symbol: string, limit=365): Promise<any[]> {
  // NOTE: I know this is ugly but using params / header objects doesn't work with this API for some reason
  return axios.get(`${process.env.CC_API_URL}/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=${limit}&api_key=${process.env.CC_API_KEY}`)
    .then((result) => {
      // console.log(result.data.Data.Data); // DEBUG
      return result.data.Data.Data;
    });
}

// Get a decimal representing a price volatility for the provided asset from the provided currentPrice
export async function getAssetPriceVolatility(asset: Asset, currentPrice: number, lookback=365, window=14): Promise<number> {
  // TODO: create conditionals for the different AssetTypes
  let priceData = await getCryptoPriceHistoricalDataFromAPI(asset.symbol, lookback);
  for (let entry of priceData) {
    await _createAssetPriceHistoryIfNotExists(asset.assetId, entry.close, entry.time); // TODO: Make this more efficient, use a pool client
  }
  let res = await _getAssetPriceHistoryByAssetIdLimit(asset.assetId, lookback);
  let dbPrices = res.map((e) => parseFloat(e.price));
  let decimalVolatility = _getPriceVolatilityFromPrices(dbPrices, window);
  return decimalVolatility;
}

// Get a decimal representing a price volatility for the provided asset from the provided currentPrice
// Doesn't make an API call to update historical volatility
export async function getAssetPriceVolatilityDebug(asset: Asset, currentPrice: number, lookback=365, window=14): Promise<number> {
  // TODO: create conditionals for the different assetTypes
  let res = await _getAssetPriceHistoryByAssetIdLimit(asset.assetId, lookback);
  let dbPrices = res.map((e) => parseFloat(e.price));
  let decimalVolatility = _getPriceVolatilityFromPrices(dbPrices, window);
  return decimalVolatility;
}

// TEST
(async () => {
  let testAsset = await getAssetById(1);
  let vol = await getAssetPriceVolatilityDebug(testAsset, 20295.80, 365);
  console.log(vol);
});
