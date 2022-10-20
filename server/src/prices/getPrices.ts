// TODO: Create
// This is going to be the controller for retrieving realtime market data on assets
// Will require a price API for each individual asset, but try to group them into APIs
// i.e. use https://coinmarketcap.com/api/ for crypto

import axios from 'axios';

// Known asset IDs:
// Bitcoin - 1

// TODO: Change *_SANDBOX_URL to process.env.CMC_API_URL and process.env.CMC_API_KEY in production
const CMC_API_SANDBOX_URL = 'https://sandbox-api.coinmarketcap.com';
const CMC_API_SANDBOX_KEY = 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c';


async function getCryptoPrice(assetId: number): Promise<number> {
  return axios.get(`${CMC_API_SANDBOX_URL}/v2/cryptocurrency/quotes/latest`, {
    params: {
      id: assetId
    },
    headers: {
      'X-CMC_PRO_API_KEY': CMC_API_SANDBOX_KEY as string
    }
  })
    .then((result) => {
      // console.log(result.data.data[assetId].quote['USD']);
      console.log(result.data.data);
      return result.data.data[assetId].quote['USD'].price;
    })
    .catch((error) => console.log(error));
}

export function getAssetPrice(assetId: number, assetType: string): Promise<number> {
  if (assetType === 'crypto') {
    return getCryptoPrice(assetId);
  }
  return getCryptoPrice(assetId); // DEBUG: Placeholder until other financial APIs are implemented
}

// TEST
// getAssetPrice(1, 'crypto');

