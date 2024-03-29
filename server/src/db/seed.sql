-- INSERT INTO accounts (
-- 	email,
-- 	pw_hash,
-- 	first_name,
-- 	last_name,
-- 	paper
-- ) VALUES (
-- 	'guy@test.com',
-- 	'3oi2jrfldsk290u',
-- 	'Guy',
-- 	'Person',
-- 	100
-- );

-- INSERT INTO accounts (
-- 	email,
-- 	pw_hash,
-- 	first_name,
-- 	last_name,
-- 	paper
-- ) VALUES (
-- 	'guyTwo@test.com',
-- 	'3oi2jrfldsk290u',
-- 	'Guy Two',
-- 	'Person Again',
-- 	200
-- );

INSERT INTO assets (
	asset_type,
	asset_amount,
	name,
	symbol,
	last_price,
	price_api_id,
	icon_url
) VALUES (
	'crypto',
	0.1,
	'Bitcoin',
	'BTC',
	0,
	1,
	'https://1000logos.net/wp-content/uploads/2018/05/Bitcoin-Logo.png'
);

INSERT INTO assets (
	asset_type,
	asset_amount,
	name,
	symbol,
	last_price,
	price_api_id,
	icon_url
) VALUES (
	'crypto',
	1,
	'Ethereum',
	'ETH',
	0,
	1027,
	'https://blog.logomyway.com/wp-content/uploads/2021/11/Ethereum-logo.png'
);

INSERT INTO assets (
	asset_type,
	asset_amount,
	name,
	symbol,
	last_price,
	price_api_id,
	icon_url
) VALUES (
	'crypto',
	1,
	'Binance Coin',
	'BNB',
	0,
	1839,
	'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Binance-Coin-BNB-icon.png'
);

INSERT INTO pools (
	account_id,
	asset_id,
	asset_amount
) VALUES (
	1,
	1,
	10
);

INSERT INTO pools (
	account_id,
	asset_id,
	asset_amount
) VALUES (
	1,
	2,
	10
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20200,
	'2022-12-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20400,
	'2022-12-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20600,
	'2022-12-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20800,
	'2022-12-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	21000,
	'2022-12-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20200,
	'2022-11-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20400,
	'2022-11-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20600,
	'2022-11-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20800,
	'2022-11-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	21000,
	'2022-11-26 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20200,
	'2022-11-06 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20400,
	'2022-11-06 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20600,
	'2022-11-06 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20800,
	'2022-11-06 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	21000,
	'2022-11-06 15:00:00.000000'
);

INSERT INTO contract_types (
	asset_id,
	direction,
	strike_price,
	expires_at
) VALUES (
	1,
	true,
	20000,
	'2022-10-28 15:00:00.000000'
);

-- INSERT INTO contract_types (
-- 	asset_id,
-- 	asset_amount,
-- 	direction,
-- 	strike_price,
-- 	expires_at
-- ) VALUES (
-- 	2,
-- 	20,
-- 	false,
-- 	1500,
-- 	'5022-12-31 23:24:11.519704'
-- );

-- INSERT INTO contracts (
-- 	type_id,
-- 	owner_id,
-- 	ask_price
-- ) VALUES (
-- 	1,
-- 	1,
-- 	2.5
-- );

-- INSERT INTO contracts (
-- 	type_id,
-- 	owner_id,
-- 	ask_price
-- ) VALUES (
-- 	2,
-- 	2,
-- 	2.5
-- );

-- INSERT INTO bids (
-- 	type_id,
-- 	account_id,
-- 	bid_price
-- ) VALUES (
-- 	1,
-- 	1,
-- 	2.4
-- );

-- INSERT INTO trades (
-- 	contract_id,
-- 	type_id,
-- 	buyer_id,
-- 	seller_id,
-- 	sale_price
-- ) VALUES (
-- 	1,
-- 	1,
-- 	1,
-- 	1,
-- 	6
-- );

