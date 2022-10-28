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
	price_api_id
) VALUES (
	'crypto',
	0.1,
	'Bitcoin',
	'BTC',
	20250,
	1
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

-- INSERT INTO pools (
-- 	account_id,
-- 	asset_id,
-- 	asset_amount
-- ) VALUES (
-- 	2,
-- 	2,
-- 	100.2
-- );

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

INSERT INTO contracts (
	type_id,
	owner_id,
	ask_price
) VALUES (
	1,
	1,
	2.5
);

-- INSERT INTO contracts (
-- 	type_id,
-- 	owner_id,
-- 	ask_price
-- ) VALUES (
-- 	2,
-- 	2,
-- 	2.5
-- );

INSERT INTO bids (
	type_id,
	account_id,
	bid_price
) VALUES (
	1,
	2,
	2.4
);

INSERT INTO trades (
	contract_id,
	type_id,
	buyer_id,
	seller_id,
	sale_price
) VALUES (
	1,
	1,
	1,
	1,
	6
);

