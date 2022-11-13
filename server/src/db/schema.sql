DROP DATABASE IF EXISTS lightning;
CREATE DATABASE lightning;

\c lightning;

-- TODO: Ensure that datetime / timestamp format usage is consistent throughout the app, given that some are being converted
-- TODO: Make sure nobody can trace back pools to account information, don't want people harassing others
CREATE TABLE accounts (
	account_id SERIAL NOT NULL PRIMARY KEY,
	email VARCHAR(64) NOT NULL UNIQUE,
	pw_hash VARCHAR(60) NOT NULL,
	first_name VARCHAR(24) NOT NULL,
	last_name VARCHAR(24) NOT NULL,
	paper DECIMAL DEFAULT 0 CHECK (paper>=0) -- Represents the paper USD being used for trades
);

CREATE INDEX accounts_email_idx ON accounts(email);

CREATE TYPE asset_type_enum AS ENUM ('crypto', 'stock', 'currency');
CREATE TABLE assets (
	asset_id SERIAL NOT NULL PRIMARY KEY,
	asset_type asset_type_enum,
	asset_amount DECIMAL NOT NULL, -- Represents how much of each asset is underwriting contracts
	name VARCHAR(60) NOT NULL,
	symbol VARCHAR(24) NOT NULL,
	price_api_id INTEGER NOT NULL, -- Used by respective price API for price lookups
	last_price DECIMAL NOT NULL,
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When last_price was updated
	icon_url TEXT
	--CONSTRAINT symbol_unique UNIQUE (assets) -- TODO: Make a constraint where symbol + type combo must be unique
);

CREATE INDEX assets_symbol_idx ON assets(symbol);

CREATE TABLE asset_prices (
	asset_price_id SERIAL NOT NULL PRIMARY KEY,
	asset_id INTEGER NOT NULL,
	price DECIMAL NOT NULL,
	data_period DATE NOT NULL,
	CONSTRAINT fk_asset_id FOREIGN KEY(asset_id) REFERENCES assets(asset_id)
);

CREATE INDEX asset_prices_asset_id_idx ON asset_prices(asset_id);


-- Represents the pools which exist for an asset
-- NOTE: With the flat out deletion of account_assets there's now no balance for a user's
-- assets outside of pools, but when this is translated to the bc/wallet model that should be alright
CREATE TABLE pools (
	pool_id SERIAL NOT NULL PRIMARY KEY,
	account_id INTEGER NOT NULL,
	asset_id INTEGER NOT NULL,
	asset_amount DECIMAL NOT NULL DEFAULT 0 CHECK (asset_amount>=0),
	reserve_amount DECIMAL NOT NULL DEFAULT 0 CHECK (reserve_amount>=0), -- Stores liquidity to trade if put option is exercised
	trade_fees DECIMAL NOT NULL DEFAULT 0 CHECK (trade_fees>=0), -- Amount provided by contract trading fees, able to be withdrawn into account balance
	CONSTRAINT fk_account_id FOREIGN KEY(account_id) REFERENCES accounts(account_id),
	CONSTRAINT fk_asset_id FOREIGN KEY(asset_id) REFERENCES assets(asset_id)
);

CREATE INDEX pools_account_id_idx ON pools(account_id);
CREATE INDEX pools_asset_id_idx ON pools(asset_id);

-- Represents all possible types of contracts that can be created
CREATE TABLE contract_types (
	contract_type_id SERIAL NOT NULL PRIMARY KEY,
	asset_id INTEGER NOT NULL,
	direction BOOLEAN NOT NULL, -- true for 'up / call', false for 'down / put'
	strike_price DECIMAL NOT NULL,
	expires_at TIMESTAMP NOT NULL, -- TODO: Create constraint, max 2 weeks out from creation
	CONSTRAINT fk_asset_id FOREIGN KEY(asset_id) REFERENCES assets(asset_id)
);

CREATE INDEX contract_types_asset_id_idx ON contract_types(asset_id);
CREATE INDEX contract_types_expires_at_idx ON contract_types(expires_at);

-- Represents the instances of outstanding contracts
-- TODO: There was a reason you seperated contracts and contract_types, but do some research if it's really the right way. Would save on a lot of join lookups if the contract_types properties were consolidated into contracts
-- The main holdup right now is how the bids table considers contract_types
CREATE TABLE contracts (
	contract_id SERIAL NOT NULL PRIMARY KEY,
	type_id INTEGER NOT NULL,
	owner_id INTEGER DEFAULT NULL, -- Can be NULL on creation, TODO: Do I need to say "Default NULL" here?
	ask_price DECIMAL DEFAULT NULL, -- Can be NULL if not being actively offered
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	exercised BOOLEAN DEFAULT false,
	exercised_amount DECIMAL DEFAULT NULL,
	CONSTRAINT fk_type_id FOREIGN KEY(type_id) REFERENCES contract_types(contract_type_id),
	CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES accounts(account_id)
);

CREATE INDEX contracts_type_id_idx ON contracts(type_id);
CREATE INDEX contracts_owner_id_idx ON contracts(owner_id);

-- When a contract draws an amount from a pool, it creates a pool lock for that amount
-- To get how much can be put into locks from pools.asset_amount, you subtract the currently locked amount, summed from
-- All lock_amount where pool_locks.pool_id = pools.pool_id
-- When a contract is created for an asset, it goes through the list of pools and creates pool_lock records for pools which
-- Have unlocked amounts. If it hits the max amount for a pool, it creates a lock and keeps moving until it's done creating them.
-- When a contract is traded, an amount is distributed to each associated pool_lock, incrementing trade_fees by that amount
-- To know how much of the overall trade_fee should be provided to a pool_lock, compare pool_locks.asset_amount to contract_types.asset_amount
CREATE TABLE pool_locks (
	pool_lock_id SERIAL NOT NULL PRIMARY KEY,
	pool_id INTEGER NOT NULL,
	contract_id INTEGER NOT NULL,
	asset_amount DECIMAL NOT NULL DEFAULT 0 CHECK (asset_amount>=0),
	reserve_amount DECIMAL NOT NULL DEFAULT 0 CHECK (reserve_amount>=0), -- Stores liquidity to trade if put option is exercised
	reserve_credit DECIMAL NOT NULL DEFAULT 0 CHECK (reserve_credit>=0), -- Compensates in case put covering does not happen at a high enough price to cover strike
	expires_at TIMESTAMP NOT NULL,
	trade_fees DECIMAL NOT NULL DEFAULT 0 CHECK (trade_fees>=0), -- Read-only amount provided by contract trade fees
	CONSTRAINT fk_pool_id FOREIGN KEY(pool_id) REFERENCES pools(pool_id),
	CONSTRAINT fk_contract_id FOREIGN KEY(contract_id) REFERENCES contracts(contract_id)
);

CREATE INDEX pool_locks_pool_id_idx ON pool_locks(pool_id);
CREATE INDEX pool_locks_contract_id_idx ON pool_locks(contract_id);
CREATE INDEX pool_locks_expires_at_idx ON pool_locks(expires_at);

-- We are referencing contract types in order to keep bidding organized to specific configurations of contracts
CREATE TABLE bids (
	bid_id SERIAL NOT NULL PRIMARY KEY,
	type_id INTEGER NOT NULL,
	account_id INTEGER NOT NULL,
	bid_price DECIMAL NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- TODO: Have a last_updated field(?)
	CONSTRAINT fk_type_id FOREIGN KEY(type_id) REFERENCES contract_types(contract_type_id),
	CONSTRAINT fk_account_id FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);

CREATE INDEX bids_type_id_idx ON bids(type_id);
CREATE INDEX bids_account_id_idx ON bids(account_id);

CREATE TABLE trades (
	trade_id SERIAL NOT NULL PRIMARY KEY,
	contract_id INTEGER NOT NULL,
	type_id INTEGER NOT NULL,
	buyer_id INTEGER NOT NULL,
	seller_id INTEGER, -- Can be null if the contract is being purchased from the AI
	sale_price DECIMAL NOT NULL,
	sale_cost DECIMAL NOT NULL,
	trade_fee DECIMAL NOT NULL DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_contract_id FOREIGN KEY(contract_id) REFERENCES contracts(contract_id),
	CONSTRAINT fk_type_id FOREIGN KEY(type_id) REFERENCES contract_types(contract_type_id),
	CONSTRAINT fk_buyer_id FOREIGN KEY(buyer_id) REFERENCES accounts(account_id),
	CONSTRAINT fk_seller_id FOREIGN KEY(seller_id) REFERENCES accounts(account_id)
);

CREATE INDEX trades_type_id_idx ON trades(type_id);
CREATE INDEX trades_buyer_id_idx ON trades(buyer_id);
CREATE INDEX trades_seller_id_idx ON trades(seller_id);
CREATE INDEX trades_created_at_idx ON trades(created_at);
