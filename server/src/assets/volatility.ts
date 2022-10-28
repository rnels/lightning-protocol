// Controller for retrieving volatility for provided asset
// TODO: Create

import dotenv from 'dotenv'; // DEBUG
dotenv.config(); // DEBUG

import axios from 'axios';
import { Asset, AssetType } from '../types';
import { _createAssetPriceHistoryIfNotExists, _getAssetPriceHistoryByAssetId, _getAssetPriceHistoryByAssetIdLimit } from '../models/assetModel';

// NOTE: Known crypto asset Symbols (CC):
  // Bitcoin - BTC
  // Ethereum - ETH

// Outputs the volatility in percentage from avg. price (%) for an array of prices
// TODO: Average it out further by getting volatality in periods, introducing weights for recency, etc.
function _getPriceVolatilityFromPrices(prices: number[], groupedBy=30): number {
  if (groupedBy > prices.length) { groupedBy = prices.length; } // Safety in case it's passed less than the groupedBy prices
  let groupsArray: number[] = [];
  const getGroupVol = (priceGroup: number[]) => {
    let priceSum = priceGroup.reduce((sum, a) => sum + a, 0);
    let priceAvg = priceSum / priceGroup.length;
    let squaredArr: number[] = [];
    for (let price of priceGroup) {
      let dif = price - priceAvg;
      squaredArr.push(Math.pow(dif, 2));
    }
    let squaredDif = squaredArr.reduce((sum, a) => sum + a, 0);
    let variance = squaredDif / priceGroup.length;
    let stdev = Math.sqrt(variance);
    let groupVolatility = stdev / priceAvg;
    return groupVolatility;
  }
  for (let i = 0; i < prices.length; i+=groupedBy) {
    groupsArray.push(getGroupVol(prices.slice(i, i + groupedBy)));
  }
  let volatilitySum = groupsArray.reduce((sum, a) => sum + a, 0); // Get sum of group volatility
  let volatility = volatilitySum / groupsArray.length; // Get average volatility
  // console.log('volatility', volatility); // DEBUG
  return volatility;
}

function getCryptoPriceHistoricalDataFromApi(symbol: string, limit=365): Promise<any[]> {
  return axios.get(`${process.env.CC_API_URL}/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=${limit}&api_key=${process.env.CC_API_KEY}`)
    .then((result) => {
      // console.log(result.data.Data.Data); // DEBUG
      return result.data.Data.Data;
    });
}

// Get a decimal representing a price volatility for the provided asset from the provided currentPrice
export async function getAssetPriceVolatility(asset: Asset, currentPrice: number, lookback=365): Promise<number> {
  // TODO: create conditionals for the different AssetTypes
  let priceData = await getCryptoPriceHistoricalDataFromApi(asset.symbol, lookback);
  for (let entry of priceData) {
    await _createAssetPriceHistoryIfNotExists(asset.assetId, entry.close, entry.time); // TODO: Make this more efficient, use a pool client
  }
  let res = await _getAssetPriceHistoryByAssetIdLimit(asset.assetId, lookback);
  let dbPrices = res.map((e) => parseFloat(e.price));
  let decimalVolatility = _getPriceVolatilityFromPrices(dbPrices);
  return decimalVolatility;
}

// Get a decimal representing a price volatility for the provided asset from the provided currentPrice
// Doesn't make an API call to update historical volatility
export async function getAssetPriceVolatilityNoAPI(asset: Asset, currentPrice: number, lookback=365): Promise<number> {
  // TODO: create conditionals for the different AssetTypes
  let res = await _getAssetPriceHistoryByAssetIdLimit(asset.assetId, lookback);
  let dbPrices = res.map((e) => parseFloat(e.price));
  let decimalVolatility = _getPriceVolatilityFromPrices(dbPrices);
  return decimalVolatility;
}

// TEST
(async () => {
  let testAsset: Asset = {
    assetId: 1,
    assetType: AssetType.Crypto,
    assetAmount: 0.1,
    name: 'Bitcoin',
    symbol: 'BTC',
    priceApiId: 1
  }
  let vol = await getAssetPriceVolatilityNoAPI(testAsset, 20253, 365);
  console.log(vol);
});
