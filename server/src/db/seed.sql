INSERT INTO accounts (
	email,
	pw_hash,
	first_name,
	last_name
) VALUES (
	'guy@test.com',
	'3oi2jrfldsk290u',
	'Guy', 'Person'
);

INSERT INTO accounts (
	email,
	pw_hash,
	first_name,
	last_name
) VALUES (
	'guyTwo@test.com',
	'3oi2jrfldsk290u',
	'Guy Two', 'Person Again'
);

INSERT INTO listings (
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

INSERT INTO tokens (token_id) VALUES (1);

INSERT INTO pools (
	account_id,
	token_id,
	token_amount
) VALUES (
	1,
	1,
	100
);

INSERT INTO contract_types (
	listing_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20000,
	CURRENT_TIMESTAMP
);

INSERT INTO contract_types (
	listing_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	false,
	18000,
	CURRENT_TIMESTAMP
);

INSERT INTO contracts (
	type_id,
	pool_id,
	ask_price
) VALUES (
	1,
	1,
	2.5
);

INSERT INTO bids (
	type_id,
	account_id,
	bid_price
) VALUES (
	1,
	2,
	2.4
);
