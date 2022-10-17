import dotenv from 'dotenv';
dotenv.config();
import * as accounts from '../../models/accountModel';
import * as listings from '../../models/listingModel';
import * as tokens from '../../models/tokenModel';
import * as pools from '../../models/poolModel';
import * as contractTypes from '../../models/contractTypeModel';
import * as contracts from '../../models/contractModel';
import * as bids from '../../models/bidModel';
import * as trades from '../../models/tradeModel';
import { Account, Listing, Token, Pool, Contract, ContractType, Bid, Trade } from '../../types';
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
    lastName: 'Person'
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
  let result = await accounts.getAccountAuthByEmail(email);
  console.log(result);
  console.log(result.rows[0]);
});

// LISTINGS //

// CREATE LISTING
(async () => {
  let listing: Listing = {
    assetType: 'crypto',
    name: 'Ethereum',
    symbol: 'ETH'
  };
  let result = await listings.createListing(listing);
  console.log(result);
});

// GET ALL LISTINGS
(async () => {
  let result = await listings.getAllListings();
  console.log(result);
  console.log(result.rows);
});

// GET LISTING BY ID
(async () => {
  let listingId = 1;
  let result = await listings.getListingById(listingId);
  console.log(result);
  console.log(result.rows[0]);
});

// GET LISTINGS BY ASSET TYPE
(async () => {
  let assetType = 'crypto';
  let result: QueryResult;
  try {
    result = await listings.getListingsByAssetType(assetType);
    console.log(result);
    console.log(result.rows);
  } catch (error) {
    console.log('There was an error', error);
  }
});

// TOKENS //

// CREATE TOKEN
(async () => {
  let token: Token = {
    tokenId: 1
  };
  let result = await tokens.createToken(token);
  console.log(result);
});

// GET ALL TOKENS
(async () => {
  let result = await tokens.getAllTokens();
  console.log(result);
  console.log(result.rows);
});

// GET TOKEN BY ID
(async () => {
  let tokenId = 1;
  let result = await tokens.getTokenById(tokenId);
  console.log(result);
  console.log(result.rows[0]);
});

// POOLS //

// CREATE POOL
(async () => {
  let pool: Pool = {
    accountId: 1,
    tokenId: 1,
    tokenAmount: 100,
    locked: false
  };
  let result = await pools.createPool(pool);
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

// GET ALL POOLS BY ACCOUNT ID
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
    listingId: 1,
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

// GET ALL CONTRACT TYPES BY LISTING ID
(async () => {
  let listingId = 1;
  let result = await contractTypes.getContractTypesByListingId(listingId);
  console.log(result);
  console.log(result.rows);
});

// CONTRACTS //

// CREATE CONTRACT
(async () => {
  let contract: Contract = {
    typeId: 1,
    ownerId: 1,
    poolId: 1,
    askPrice: 20.5,
    createdAt: Date.now()
  };
  let result = await contracts.createContract(contract);
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

// GET ALL CONTRACTS BY TYPE ID
(async () => {
  let typeId = 1;
  let result = await contracts.getContractsByTypeId(typeId);
  console.log(result);
  console.log(result.rows);
});

// GET ALL CONTRACTS BY BUYER ID
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

// GET ALL BIDS BY TYPE ID
(async () => {
  let typeId = 1;
  let result = await bids.getBidsByTypeId(typeId);
  console.log(result);
  console.log(result.rows);
});

// GET ALL BIDS BY ACCOUNT ID
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
    salePrice: 2.5
  };
  let result = await trades.createTrade(trade);
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

// GET ALL TRADES BY CONTRACT ID
(async () => {
  let contractId = 1;
  let result = await trades.getTradesByContractId(contractId);
  console.log(result);
  console.log(result.rows);
});

// GET ALL TRADES BY ACCOUNT ID
(async () => {
  let accountId = 1;
  let result = await trades.getAllTradesByAccountId(accountId);
  console.log(result);
  console.log(result.rows);
});
