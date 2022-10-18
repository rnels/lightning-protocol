INSERT INTO accounts (
	email,
	pw_hash,
	first_name,
	last_name,
	paper
) VALUES (
	'guy@test.com',
	'3oi2jrfldsk290u',
	'Guy',
	'Person',
	100
);

INSERT INTO accounts (
	email,
	pw_hash,
	first_name,
	last_name,
	paper
) VALUES (
	'guyTwo@test.com',
	'3oi2jrfldsk290u',
	'Guy Two',
	'Person Again',
	200
);

INSERT INTO assets (
	asset_type,
	name,
	symbol,
	price_feed_url
) VALUES (
	'crypto',
	'Bitcoin',
	'BTC',
	'https://coinmarketcap.com/api/' -- Placeholder, need to do something else once I figure out the implementation
);

INSERT INTO assets (
	asset_type,
	name,
	symbol,
	price_feed_url
) VALUES (
	'crypto',
	'Ethereum',
	'ETH',
	'https://coinmarketcap.com/api/' -- Placeholder, need to do something else once I figure out the implementation
);

INSERT INTO pools (
	account_id,
	asset_id,
	asset_amount
) VALUES (
	1,
	1,
	50.1
);

INSERT INTO pools (
	account_id,
	asset_id,
	asset_amount
) VALUES (
	2,
	2,
	100.2
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	false,
	20000.19,
	CURRENT_TIMESTAMP
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	2,
	true,
	1500,
	CURRENT_TIMESTAMP
);

INSERT INTO contracts (
	type_id,
	owner_id,
	asset_amount,
	ask_price
) VALUES (
	1,
	1,
	5,
	2.5
);

INSERT INTO contracts (
	type_id,
	owner_id,
	asset_amount,
	ask_price
) VALUES (
	2,
	2,
	10,
	2.5
);

INSERT INTO bids (
	type_id,
	account_id,
	bid_price
) VALUES (
	2,
	2,
	2.4
);

INSERT INTO trades (
	contract_id,
	buyer_id,
	seller_id,
	sale_price
) VALUES (
	1,
	1,
	2,
	1.5
);

