// Controller for retrieving realtime market data on assets
// TODO: Requires a price API for each asset type
// Ex: Using https://coinmarketcap.com/api/ for crypto
import dotenv from 'dotenv'; // DEBUG - Only need when running file standalone
dotenv.config(); // DEBUG - Only need when running file standalone

import axios from 'axios';
import { getAssetById, _createAssetPriceHistoryIfNotExists } from '../models/assetModel';
import { Asset } from '../types';

// NOTE: Known crypto asset IDs (CMC):
  // Bitcoin - 1
  // Ethereum - 1027

// DEBUG: Change process.env.CMC_API_* to process.env.CMC_API_SANDBOX_*

function _getCryptoPriceHistoricalDataFromAPI(symbol: string, limit=365): Promise<any[]> {
  // NOTE: I know this is ugly but using params / header objects doesn't work with this API for some reason
  return axios.get(`${process.env.CC_API_URL}/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=${limit}&api_key=${process.env.CC_API_KEY}`)
    .then((result) => {
      // console.log(result.data.Data.Data); // DEBUG
      return result.data.Data.Data;
    });
}

function getCryptoPrice(priceApiId: number): Promise<number> {
  return axios.get(`${process.env.CMC_API_URL}/v2/cryptocurrency/quotes/latest`, {
    params: {
      id: priceApiId
    },
    headers: {
      'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY as string
    }
  })
    .then((result) => {
      return Number(result.data.data[priceApiId].quote['USD'].price);
    });
}

export async function updateCryptoPriceHistory(asset: Asset, limit=365) {
  let priceData = await _getCryptoPriceHistoricalDataFromAPI(asset.symbol, limit);
  let createPromises = [];
  for (let entry of priceData) {
    createPromises.push(
      _createAssetPriceHistoryIfNotExists(asset.assetId, entry.close, entry.time) // TODO: Make this more efficient, use batching(?)
    );
  }
  Promise.all(createPromises);
}

export function getAssetPriceFromAPI(priceApiId: number, assetType: string): Promise<number> {
  if (assetType === 'crypto') {
    return getCryptoPrice(priceApiId);
  }
  return getCryptoPrice(priceApiId); // DEBUG: Placeholder until other financial APIs are implemented
}

// TESTS
(async () => {
  let asset = await getAssetById(1);
  let price = await getAssetPriceFromAPI(asset.assetId, asset.assetType);
  console.log('getAssetPriceFromAPI price:', price);
});

(async () => {
  let asset = await getAssetById(1);
  await updateCryptoPriceHistory(asset);
  console.log('updateCryptoPriceHistory complete');
});
