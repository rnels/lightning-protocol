export type Account = {
  accountId?: number,
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
	paper: number
};

export type Asset = {
  assetId?: number,
	assetType: string,
	name: string,
	symbol: string,
	priceFeedUrl?: string,
	iconUrl?: string
};

export type Pool = {
  poolId?: number,
	accountId: number,
	assetId: number,
	assetAmount: number
};

export type PoolLock = {
  poolLockId?: number,
	poolId: number,
	contractId: number,
	assetAmount: number,
	expiresAt: boolean,
	tradeFees?: number
};

export type ContractType = {
	contractTypeId?: number,
	assetId: number,
	assetAmount: number,
	direction: boolean,
	strikePrice: number,
	expiresAt: number
};

export type Contract = {
	contractId?: number,
	typeId: number,
	ownerId: number,
	askPrice?: number,
	createdAt?: number,
	exercised: boolean
};

export type Bid = {
	bidId?: number,
	typeId: number,
	accountId: number,
	bidPrice: number,
	createdAt?: number
};

export type Trade = {
	tradeId?: number,
	contractId: number,
	buyerId: number,
  sellerId: number,
	salePrice: number,
	tradeFee: number,
  createdAt?: number
};

export type User = {
  id: number
};
