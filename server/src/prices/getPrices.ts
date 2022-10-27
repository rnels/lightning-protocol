// Controller for retrieving realtime market data on assets
// TODO: Requires a price API for each asset type
// Ex: Using https://coinmarketcap.com/api/ for crypto

import axios from 'axios';

// NOTE: Known crypto asset IDs:
  // Bitcoin - 1

// TODO: Change *_SANDBOX_URL to process.env.CMC_API_URL and process.env.CMC_API_KEY in production
const CMC_API_SANDBOX_URL = 'https://sandbox-api.coinmarketcap.com';
const CMC_API_SANDBOX_KEY = 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c';


function getCryptoPrice(priceApiId: number): Promise<number> {
  return axios.get(`${CMC_API_SANDBOX_URL}/v2/cryptocurrency/quotes/latest`, {
    params: {
      id: priceApiId
    },
    headers: {
      'X-CMC_PRO_API_KEY': CMC_API_SANDBOX_KEY as string
    }
  })
    .then((result) => {
      // console.log(result.data.data); // DEBUG
      // console.log(result.data.data[priceApiId].quote['USD']); // DEBUG
      // return 100; // DEBUG
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
