// NOTE: Calls to the API also return an accountId, but it's not used in the client type
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
	lastUpdated: string, // TODO: Convert to date
	iconUrl?: string,
	contractTypes?: ContractType[],
	pools?: Pool[]
};

export type Pool = {
  poolId: number,
	assetId: number,
	assetAmount: number,
	reserveAmount: number,
	tradeFees: number,
	poolLocks?: PoolLock[]
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
	expiresAt: Date,
	contracts?: Contract[],
	bids?: Bid[]
};

export type Contract = {
	contractId: number,
	typeId: number,
	createdAt: number, // TODO: Convert to date
	exercised: boolean,
	askPrice?: number,
	exercisedAmount?: number,
	trades?: Trade[]
};

export type Bid = {
	bidId: number,
	typeId: number,
	bidPrice: number,
	createdAt: number // TODO: Convert to date
};

export type Trade = {
	tradeId: number,
	contractId: number,
	typeId: number,
	salePrice: number,
	saleCost: number,
	tradeFee: number,
  createdAt: string, // TODO: Convert to date
	isBuyer: boolean
};
