export type Account = {
  accountId?: number,
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string
}

export type Listing = {
  listingId?: number,
	assetType: string,
	name: string,
	symbol: string,
	price_feed_url?: string,
	icon_url?: string
}

export type Token = {
  tokenId: number
}

export type Pool = {
  poolId?: number,
	accountId: number,
	tokenId: number,
	tokenAmount: number,
	locked: boolean
}

export type ContractType = {
	contractTypeId?: number,
	listingId: number,
	direction: boolean,
	strikePrice: number,
	expiresAt: Date
}

export type Contract = {
	contractId?: number,
	typeId: number,
	buyerId?: number,
	poolId: number,
	askPrice?: number,
	createdAt: Date
}

export type Bid = {
	bidId?: number,
	typeId: number,
	accountId: number,
	bidPrice: number
}

export type Trade = {
	tradeId?: number,
	contractId: number,
	buyerId: number,
  sellerId: number,
	salePrice: number,
  createdAt: Date
}

export type User = {
  id: number
}
