DROP DATABASE IF EXISTS lightning;
CREATE DATABASE lightning;

\c lightning;

CREATE TABLE accounts (
	account_id SERIAL NOT NULL PRIMARY KEY,
	email VARCHAR(64),
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
	icon_url TEXT,
	lang_bg_url TEXT
	--CONSTRAINT symbol_unique UNIQUE (listings) -- TODO: Make a constraint where symbol + type combo must be unique
);

CREATE INDEX listings_symbol_idx ON listings(symbol);

-- Represents the coverings owed to an account
-- TODO: Create
CREATE TABLE covers {
	token_id
};

-- Represents the amount of plays created by an account
-- TODO: Create
CREATE TABLE plays {
	play_id SERIAL NOT NULL PRIMARY KEY,
};
