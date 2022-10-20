import dotenv from 'dotenv';
dotenv.config();
import * as accounts from '../../models/accountModel';
import * as assets from '../../models/assetModel';
import * as pools from '../../models/poolModel';
import * as contractTypes from '../../models/contractTypeModel';
import * as contracts from '../../models/contractModel';
import * as bids from '../../models/bidModel';
import * as trades from '../../models/tradeModel';
import { Account, Asset, Pool, Contract, ContractType, Bid, Trade } from '../../types';
import { QueryResult } from 'pg';

// Will eventually replace this with jest testing in queries.test.js, but for now...

// ACCOUNTS //
// NOTE: Since we are creating a pw hash directly rather than going through auth
// we can't log in to these accounts using a service like postman to test the routes

// CREATE ACCOUNT
(async () => {
  let account: Account = {
    email: 'guy@test.com',
    passwordHash: '3oi2jrfldsk290u',
    firstName: 'Guy',
    lastName: 'Person',
    paper: 100
  };
  let result = await accounts.createAccount(account);
  console.log(result);
});

// GET ACCOUNTS INFO
(async () => {
  let accountId = 1;
  let result = await accounts.getAccountInfoById(accountId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET ACCOUNT AUTH
(async () => {
  let email = 'guy@test.com';
  let result = await accounts._getAccountAuthByEmail(email);
  console.log(result);
  console.log(result.rows[0]);
});

// ASSETS //

// CREATE ASSET
(async () => {
  let asset: Asset = {
    assetType: 'crypto',
    name: 'Ethereum',
    symbol: 'ETH'
  };
  let result = await assets.createAsset(asset);
  console.log(result);
});

// GET ALL ASSETS
(async () => {
  let result = await assets.getAllAssets();
  console.log(result);
  console.log(result.rows);
});

// GET ASSET BY ID
(async () => {
  let assetId = 1;
  let result = await assets.getAssetById(assetId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET ASSETS BY TYPE
(async () => {
  let assetType = 'crypto';
  let result: QueryResult;
  try {
    result = await assets.getAssetsByAssetType(assetType);
    console.log(result);
    console.log(result.rows);
  } catch (error) {
    console.log('There was an error', error);
  }
});

// POOLS //

// CREATE POOL
(async () => {
  let pool: Pool = {
    accountId: 1,
    assetId: 1,
    assetAmount: 0
  };
  let result = await pools.createPool(pool);
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
  console.log(result.rows);
});

// GET POOL BY ID
(async () => {
  let poolId = 1;
  let result = await pools.getPoolById(poolId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET POOLS BY ASSET ID
(async () => {
  let assetId = 1;
  let result = await pools.getPoolsByAssetId(assetId);
  console.log(result);
  console.log(result.rows);
});

// GET POOLS BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await pools.getPoolsByAccountId(accountId);
  console.log(result);
  console.log(result.rows);
});

// CONTRACT TYPES //

// CREATE CONTRACT TYPE
(async () => {
  let contractType: ContractType = {
    assetId: 1,
    assetAmount: 100,
    direction: true,
    strikePrice: 50.54,
    expiresAt: Date.now()
  };
  let result = await contractTypes.createContractType(contractType);
  console.log(result);
});

// GET ALL CONTRACT TYPES
(async () => {
  let result = await contractTypes.getAllContractTypes();
  console.log(result);
  console.log(result.rows);
});

// GET CONTRACT TYPE BY ID
(async () => {
  let contractTypeId = 1;
  let result = await contractTypes.getContractTypeById(contractTypeId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET CONTRACT TYPES BY ASSET ID
(async () => {
  let assetId = 1;
  let result = await contractTypes.getActiveContractTypesByAssetId(assetId);
  console.log(result);
  console.log(result.rows);
});

// CONTRACTS //

// CREATE CONTRACT
(async () => {
  let contract: Contract = {
    typeId: 1,
    ownerId: 1,
    askPrice: 20.5,
    createdAt: Date.now(),
    exercised: false
  };
  let result = await contracts.createContract(contract);
  console.log(result);
});

// UPDATE CONTRACT ASK PRICE
(async () => {
  let contractId = 1;
  let askPrice = 2.5;
  let ownerId = 1;
  let result = await contracts.updateAskPrice(contractId, askPrice, ownerId);
  console.log(result);
});

// GET ALL CONTRACTS
(async () => {
  let result = await contracts.getAllContracts();
  console.log(result);
  console.log(result.rows);
});

// GET CONTRACT BY ID
(async () => {
  let contractId = 1;
  let result = await contracts.getContractById(contractId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET CONTRACTS BY TYPE ID
(async () => {
  let typeId = 1;
  let result = await contracts.getContractsByTypeId(typeId);
  console.log(result);
  console.log(result.rows);
});

// GET CONTRACTS BY BUYER ID
(async () => {
  let ownerId = 1;
  let result = await contracts.getContractsByOwnerId(ownerId);
  console.log(result);
  console.log(result.rows);
});

// BIDS //

// CREATE BID
(async () => {
  let bid: Bid = {
    typeId: 1,
    accountId: 1,
    bidPrice: 1.2
  };
  let result = await bids.createBid(bid);
  console.log(result);
});

// GET ALL BIDS
(async () => {
  let result = await bids.getAllBids();
  console.log(result);
  console.log(result.rows);
});

// GET BID BY ID
(async () => {
  let bidId = 1;
  let result = await bids.getBidById(bidId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET BIDS BY TYPE ID
(async () => {
  let typeId = 1;
  let result = await bids.getBidsByContractTypeId(typeId);
  console.log(result);
  console.log(result.rows);
});

// GET BIDS BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await bids.getBidsByAccountId(accountId);
  console.log(result);
  console.log(result.rows);
});

// TRADES //

// CREATE TRADE
(async () => {
  let trade: Trade = {
    contractId: 1,
    buyerId: 1,
    sellerId: 2,
    salePrice: 2.5,
    tradeFee: 0
  };
  let result = await trades._createTrade(trade);
  console.log(result);
});

// GET ALL TRADES
(async () => {
  let result = await trades.getAllTrades();
  console.log(result);
  console.log(result.rows);
});

// GET TRADE BY ID
(async () => {
  let tradeId = 1;
  let result = await trades.getTradeById(tradeId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET TRADES BY CONTRACT ID
(async () => {
  let contractId = 1;
  let result = await trades.getTradesByContractId(contractId);
  console.log(result);
  console.log(result.rows);
});

// GET TRADES BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await trades.getTradesByAccountId(accountId);
  console.log(result);
  console.log(result.rows);
});
