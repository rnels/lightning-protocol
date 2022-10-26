import dotenv from 'dotenv';
dotenv.config();
import * as accounts from '../../models/accountModel';
import * as assets from '../../models/assetModel';
import * as pools from '../../models/poolModel';
import * as contractTypes from '../../models/contractTypeModel';
import * as contracts from '../../models/contractModel';
import * as bids from '../../models/bidModel';
import * as trades from '../../models/tradeModel';
import { Account, Asset, Pool, Contract, ContractType, Bid, Trade, AssetType } from '../../types';
import { QueryResult } from 'pg';

// Will eventually replace this with jest testing in queries.test.js, but for now...

// ACCOUNTS //
// NOTE: Since we are creating a pw hash directly rather than going through auth
// we can't log in to these accounts using a service like postman to test the routes

// CREATE ACCOUNT
(async () => {
  let account = {
    email: 'guy@test.com',
    passwordHash: '3oi2jrfldsk290u',
    firstName: 'Guy',
    lastName: 'Person',
    paper: 100
  };
  let result = await accounts.createAccount(account.email, account.passwordHash, account.firstName, account.lastName);
  console.log(result);
});

// GET ACCOUNTS INFO
(async () => {
  let accountId = 1;
  let result = await accounts.getAccountInfoById(accountId);
  console.log(result);
});

// GET ACCOUNT AUTH
(async () => {
  let email = 'ryan@paper.com';
  let result = await accounts._getAccountAuthByEmail(email);
  console.log(result);
});

// ASSETS //

// CREATE ASSET
(async () => {
  let asset = {
    assetType: AssetType.Crypto,
    name: 'Ethereum',
    symbol: 'ETH',
    priceApiId: 2
  };
  let result = await assets.createAsset(asset.assetType, asset.name, asset.symbol, asset.priceApiId);
  console.log(result);
});

// GET ALL ASSETS
(async () => {
  let result = await assets.getAllAssets();
  console.log(result);
});

// GET ASSET BY ID
(async () => {
  let assetId = 1;
  let result = await assets.getAssetById(assetId);
  console.log(result);
});

// GET ASSETS BY TYPE
(async () => {
  let assetType = 'crypto';
  try {
    let result = await assets.getAssetsByAssetType(assetType);
    console.log(result);
  } catch (error) {
    console.log('There was an error', error);
  }
});

// POOLS //

// CREATE POOL
(async () => {
  let accountId = 1;
  let assetId = 1;
  let assetAmount = 0;
  let result = await pools.createPool(accountId, assetId, assetAmount);
  console.log(result);
});

// DEPOSIT POOL ASSETS
(async () => {
  let poolId = 4;
  let assetAmount = 20.1;
  let ownerId = 1;
  let result = await pools.depositPoolAssets(poolId, assetAmount, ownerId);
  console.log(result);
});

// WITHDRAW POOL ASSETS
(async () => {
  let poolId = 4;
  let assetAmount = 10.2;
  let ownerId = 1;
  let result = await pools.withdrawPoolAssets(poolId, assetAmount, ownerId);
  console.log(result);
});

// GET ALL POOLS
(async () => {
  let result = await pools.getAllPools();
  console.log(result);
});

// GET POOL BY ID
(async () => {
  let poolId = 1;
  let result = await pools.getPoolById(poolId);
  console.log(result);
});

// GET POOLS BY ASSET ID
(async () => {
  let assetId = 1;
  let result = await pools.getPoolsByAssetId(assetId);
  console.log(result);
});

// GET POOLS BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await pools.getPoolsByAccountId(accountId);
  console.log(result);
});

// CONTRACT TYPES //

// CREATE CONTRACT TYPE
(async () => {
  let assetId = 1;
  let assetAmount = 100;
  let direction = true;
  let strikePrice = 50.54;
  let expiresAt = 1340235435039430954309; // TODO: Redo this with epoch representation of long time out
  let result = await contractTypes.createContractType(
    assetId,
    assetAmount,
    direction,
    strikePrice,
    expiresAt
  );
  console.log(result);
});

// GET CONTRACT TYPE BY ID
(async () => {
  let contractTypeId = 1;
  let result = await contractTypes.getContractTypeById(contractTypeId);
  console.log(result);
});

// GET CONTRACT TYPES BY ASSET ID
(async () => {
  let assetId = 1;
  let result = await contractTypes.getActiveContractTypesByAssetId(assetId);
  console.log(result);
});

// CONTRACTS //

// CREATE CONTRACT
(async () => {
  let typeId = 1;
  let ownerId = 1;
  let askPrice = 20.5;
  let result = await contracts.createContract(
    typeId,
    ownerId,
    askPrice
  );
  console.log(result);
});

// UPDATE CONTRACT ASK PRICE
(async () => {
  let contractId = 1;
  let askPrice = 2.5;
  let ownerId = 1;
  await contracts.updateAskPrice(contractId, askPrice, ownerId);
});

// GET CONTRACT BY ID
(async () => {
  let contractId = 1;
  let result = await contracts.getContractById(contractId);
  console.log(result);
});

// GET CONTRACTS BY TYPE ID
(async () => {
  let typeId = 1;
  let result = await contracts.getActiveContractsByTypeId(typeId);
  console.log(result);
});

// GET CONTRACTS BY BUYER ID
(async () => {
  let ownerId = 1;
  let result = await contracts.getContractsByOwnerId(ownerId);
  console.log(result);
});

// BIDS //

// CREATE BID
(async () => {
  let typeId = 1;
  let accountId = 1;
  let bidPrice = 1.2;
  let result = await bids.createBid(typeId, accountId, bidPrice);
  console.log(result);
});

// GET BID BY ID
(async () => {
  let bidId = 1;
  let result = await bids.getBidById(bidId);
  console.log(result);
});

// GET BIDS BY TYPE ID
(async () => {
  let typeId = 1;
  let result = await bids.getBidsByContractTypeId(typeId);
  console.log(result);
});

// GET BIDS BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await bids.getBidsByAccountId(accountId);
  console.log(result);
});

// TRADES //

// CREATE TRADE
// (async () => {
//   let trade: Trade = {
//     contractId: 1,
//     typeId: 1,
//     buyerId: 1,
//     sellerId: 2,
//     salePrice: 2.5,
//     tradeFee: 0
//   };
//   let result = await trades._createTrade(trade);
//   console.log(result);
// });

// GET ALL TRADES
(async () => {
  let result = await trades.getAllTrades();
  console.log(result);
});

// GET TRADE BY ID
(async () => {
  let tradeId = 1;
  let result = await trades.getTradeById(tradeId);
  console.log(result);
});

// GET TRADES BY CONTRACT ID
(async () => {
  let contractId = 1;
  let result = await trades.getTradesByContractId(contractId);
  console.log(result);
});

// GET TRADES BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await trades.getTradesByAccountId(accountId);
  console.log(result);
});
