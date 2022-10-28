export type Account = {
  email: string,
  firstName: string,
  lastName: string,
	paper: number
};

export type Asset = {
  assetId: number,
	assetType: string,
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
	assetId: number,
	assetAmount: number,
	tradeFees: number
};

export type PoolLock = {
  poolLockId: number,
	poolId: number,
	contractId: number,
	assetAmount: number,
	expiresAt: number,
	tradeFees: number
};

export type ContractType = {
	contractTypeId: number,
	assetId: number,
	direction: boolean,
	strikePrice: number,
	expiresAt: string // TODO: Parse incoming expiresAt to DateTime
};

export type Contract = {
	contractId: number,
	typeId: number,
	askPrice?: number,
	createdAt: number,
	exercised: boolean,
	exercisedAmount?: number
};

export type Bid = {
	bidId: number,
	typeId: number,
	bidPrice: number,
	createdAt: number
};

export type Trade = {
	tradeId: number,
	contractId: number,
	typeId: number,
	salePrice: number,
	saleCost: number,
	tradeFee: number,
  createdAt: number
};
