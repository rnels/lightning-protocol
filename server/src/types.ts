export enum AssetType {
  Crypto = 'crypto',
	Stock = 'stock',
	Currency = 'currency'
};

export type Account = {
  accountId: number,
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
	paper: number
};

export type Asset = {
  assetId: number,
	assetType: AssetType,
	assetAmount: number,
	name: string,
	symbol: string,
	priceApiId: number,
	lastPrice: number,
	lastUpdated: string,
	iconUrl?: string
};

export type Pool = {
  poolId: number,
	accountId: number,
	assetId: number,
	assetAmount: number,
	tradeFees: number
};

export type PoolLock = {
  poolLockId: number,
	poolId: number,
	contractId: number,
	assetAmount: number,
	reserveAmount: number,
	expiresAt: Date,
	tradeFees: number
};

export type ContractType = {
	contractTypeId: number,
	assetId: number,
	direction: boolean,
	strikePrice: number,
	expiresAt: Date
};

export type Contract = {
	contractId: number,
	typeId: number,
	ownerId?: number,
	askPrice?: number,
	createdAt: string,
	exercised: boolean,
	exercisedAmount?: number
};

export type Bid = {
	bidId: number,
	typeId: number,
	accountId: number,
	bidPrice: number,
	createdAt: string
};

export type Trade = {
	tradeId: number,
	contractId: number,
	typeId: number,
	buyerId: number,
  sellerId?: number,
	salePrice: number,
	saleCost: number,
	tradeFee: number,
  createdAt: string
};

export type User = {
  id: number
};
