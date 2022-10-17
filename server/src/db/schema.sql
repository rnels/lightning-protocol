DROP DATABASE IF EXISTS lightning;
CREATE DATABASE lightning;

\c lightning;

-- TODO: Ensure that datetime / timestamp format usage is consistent throughout the app, given that some are being converted

CREATE TABLE accounts (
	account_id SERIAL NOT NULL PRIMARY KEY,
	email VARCHAR(64) UNIQUE,
	pw_hash VARCHAR(60),
	first_name VARCHAR(24),
	last_name VARCHAR(24)
);

CREATE INDEX accounts_email_idx ON accounts(email);

CREATE TYPE asset_type_enum AS ENUM ('crypto', 'stock', 'currency');
CREATE TABLE listings (
	listing_id SERIAL NOT NULL PRIMARY KEY,
	asset_type asset_type_enum,
	name VARCHAR(60) NOT NULL,
	symbol VARCHAR(24) NOT NULL,
	price_feed_url TEXT, -- TODO: Figure out how we can get price info for the listings, will need to connect with a service for realtime price updates
	icon_url TEXT
	--CONSTRAINT symbol_unique UNIQUE (listings) -- TODO: Make a constraint where symbol + type combo must be unique
);

-- Will currently only be one type of token, but will expand later
-- NOTE: Remember, 'tokens' and listings are totally seperate, tokens is intended as the paper currency and is irrelevant to the financial asset underlying a contract
CREATE TABLE tokens (
	token_id SERIAL NOT NULL PRIMARY KEY
);

CREATE TABLE account_tokens (
	account_tokens_id SERIAL NOT NULL PRIMARY KEY,
	account_id INTEGER NOT NULL,
	token_id INTEGER NOT NULL,
	token_amount DECIMAL NOT NULL DEFAULT 0 CHECK (token_amount>=0),
	CONSTRAINT fk_account_id FOREIGN KEY(account_id) REFERENCES accounts(account_id),
	CONSTRAINT fk_token_id FOREIGN KEY(token_id) REFERENCES tokens(token_id)
);

CREATE INDEX account_tokens_account_id_idx ON account_tokens(account_id);
CREATE INDEX account_tokens_token_id_idx ON account_tokens(token_id);

CREATE INDEX listings_symbol_idx ON listings(symbol);

-- Represents the pools which exist for a token
-- TODO: Create check that token_amount >= 0
CREATE TABLE pools (
	pool_id SERIAL NOT NULL PRIMARY KEY,
	account_id INTEGER NOT NULL,
	token_id INTEGER NOT NULL,
	token_amount DECIMAL NOT NULL DEFAULT 0 CHECK (token_amount>=0),
	locked BOOLEAN DEFAULT FALSE, -- When assigning a pool to a contract, set this to true, release when contract is exercised or expired
	CONSTRAINT fk_account_id FOREIGN KEY(account_id) REFERENCES accounts(account_id),
	CONSTRAINT fk_token_id FOREIGN KEY(token_id) REFERENCES tokens(token_id)
);

CREATE INDEX pools_account_id_idx ON pools(account_id);
CREATE INDEX pools_token_id_idx ON pools(token_id);

-- Represents all possible types of contracts that can be created
CREATE TABLE contract_types (
	contract_type_id SERIAL NOT NULL PRIMARY KEY,
	listing_id INTEGER NOT NULL,
	direction BOOLEAN NOT NULL, -- true for 'up / call', false for 'down / put'
	strike_price DECIMAL NOT NULL,
	expires_at TIMESTAMP NOT NULL, -- TODO: Create constraint, max 2 weeks out from creation
	CONSTRAINT fk_listing_id FOREIGN KEY(listing_id) REFERENCES listings(listing_id)
);

CREATE INDEX contract_types_listing_id_idx ON contract_types(listing_id);

-- Represents the instances of outstanding contracts
CREATE TABLE contracts (
	contract_id SERIAL NOT NULL PRIMARY KEY,
	type_id INTEGER NOT NULL,
	owner_id INTEGER NOT NULL,
	pool_id INTEGER NOT NULL, -- TODO: This means pool-contract is 1:1 which may not be ideal, revisit this later
	ask_price DECIMAL, -- Can be NULL if not being actively offered
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_type_id FOREIGN KEY(type_id) REFERENCES contract_types(contract_type_id),
	CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES accounts(account_id),
	CONSTRAINT fk_pool_id FOREIGN KEY(pool_id) REFERENCES pools(pool_id)
);

CREATE INDEX contracts_type_id_idx ON contracts(type_id);
CREATE INDEX contracts_owner_id_idx ON contracts(owner_id);

-- We are referencing contract types in order to keep bidding organized to specific configurations of contracts
CREATE TABLE bids (
	bid_id SERIAL NOT NULL PRIMARY KEY,
	type_id INTEGER NOT NULL,
	account_id INTEGER NOT NULL,
	bid_price DECIMAL NOT NULL,
	CONSTRAINT fk_type_id FOREIGN KEY(type_id) REFERENCES contract_types(contract_type_id),
	CONSTRAINT fk_account_id FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);

CREATE INDEX bids_type_id_idx ON bids(type_id);
CREATE INDEX bids_account_id_idx ON bids(account_id);

CREATE TABLE trades (
	trade_id SERIAL NOT NULL PRIMARY KEY,
	contract_id INTEGER NOT NULL,
	buyer_id INTEGER NOT NULL,
	seller_id INTEGER NOT NULL,
	sale_price DECIMAL NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_contract_id FOREIGN KEY(contract_id) REFERENCES contracts(contract_id),
	CONSTRAINT fk_buyer_id FOREIGN KEY(buyer_id) REFERENCES accounts(account_id),
	CONSTRAINT fk_seller_id FOREIGN KEY(seller_id) REFERENCES accounts(account_id)
);

CREATE INDEX trades_contract_id_idx ON trades(contract_id);
CREATE INDEX trades_buyer_id_idx ON trades(buyer_id);
CREATE INDEX trades_seller_id_idx ON trades(seller_id);
