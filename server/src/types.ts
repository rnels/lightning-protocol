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
	paper: string | number
};

export type Asset = {
  assetId: number,
	assetType: AssetType,
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

// TODO: Create extended interfaces for Pool, Contract, ContractType
// TODO: Actually implement this one
export interface AssetExt extends Asset {
	contractTypes: ContractType[],
	pools: Pool[]
}

export type Pool = {
  poolId: number,
	accountId: number,
	assetId: number,
	assetAmount: string | number,
	poolLocks?: PoolLock[]
};

export type PoolLock = {
  poolLockId: number,
	poolId: number,
	contractId: number,
	assetAmount: string | number,
	contractAssetAmount: string | number,
	reserveAmount: string | number,
	reserveCredit: string | number,
	expiresAt: string,
	tradeFees: string | number,
	premiumFee: string | number,
	released: boolean
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
	premiumFee?: string | number,
	exercisedAmount?: string | number,
	ownerId?: number,
	askPrice?: string | number,
	trades?: Trade[]
};

export type Bid = {
	bidId: number,
	typeId: number,
	accountId: number,
	bidPrice: string | number,
	createdAt: string
};

export type Trade = {
	tradeId: number,
	contractId: number,
	typeId: number,
	buyerId: number,
  sellerId?: number,
	salePrice: string | number,
	saleCost: string | number,
	tradeFee: string | number,
  createdAt: string,
	isBuyer?: boolean
};

export type User = {
  id: number
};
