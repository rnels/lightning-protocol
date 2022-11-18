// NOTE: Calls to the API also return an accountId, but it's not used in the client type
export type Account = {
  email: string,
  firstName: string,
  lastName: string,
	paper: string | number
};

export type Asset = {
  assetId: number,
	assetType: string,
	assetAmount: string | number,
	name: string,
	symbol: string,
	priceApiId: number,
	lastPrice: string | number,
	lastUpdated: string,
	iconUrl?: string,
	contractTypes?: ContractType[],
	pools?: Pool[]
};

export type Pool = {
  poolId: number,
	assetId: number,
	assetAmount: string | number,
	reserveAmount: string | number,
	tradeFees: string | number,
	poolLocks?: PoolLock[]
};

export type PoolLock = {
  poolLockId: number,
	poolId: number,
	contractId: number,
	assetAmount: string | number,
	reserveAmount: string | number,
	expiresAt: string,
	tradeFees: string | number
};

export type ContractType = {
	contractTypeId: number,
	assetId: number,
	direction: boolean,
	strikePrice: string | number,
	expiresAt: string,
	contracts?: Contract[],
	bids?: Bid[]
};

export type Contract = {
	contractId: number,
	typeId: number,
	createdAt: string,
	exercised: boolean,
	askPrice?: string | number,
	exercisedAmount?: string | number,
	trades?: Trade[]
};

export type Bid = {
	bidId: number,
	typeId: number,
	bidPrice: string | number,
	createdAt: string
};

export type Trade = {
	tradeId: number,
	contractId: number,
	typeId: number,
	salePrice: string | number,
	saleCost: string | number,
	tradeFee: string | number,
  createdAt: string,
	isBuyer: boolean
};
