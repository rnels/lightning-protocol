// Controller for retrieving realtime market data on assets
// TODO: Requires a price API for each asset type
// Ex: Using https://coinmarketcap.com/api/ for crypto
import dotenv from 'dotenv'; // DEBUG
dotenv.config(); // DEBUG

import axios from 'axios';

// NOTE: Known crypto asset IDs (CMC):
  // Bitcoin - 1

// TODO: Change *_SANDBOX_URL to process.env.CMC_API_URL and process.env.CMC_API_KEY in production

function getCryptoPrice(priceApiId: number): Promise<number> {
  return axios.get(`${process.env.CMC_API_SANDBOX_URL}/v2/cryptocurrency/quotes/latest`, {
    params: {
      id: priceApiId
    },
    headers: {
      'X-CMC_PRO_API_KEY': process.env.CMC_API_SANDBOX_KEY as string
    }
  })
    .then((result) => {
      return result.data.data[priceApiId].quote['USD'].price;
    });
}

export function getAssetPrice(priceApiId: number, assetType: string): Promise<number> {
  if (assetType === 'crypto') {
    return getCryptoPrice(priceApiId);
  }
  return getCryptoPrice(priceApiId); // DEBUG: Placeholder until other financial APIs are implemented
}

// TEST
// getAssetPrice(1, 'crypto');
