# LIGHTNING PROTOCOL ⚡
Paper trading game. Buy and sell assets and trade cards speculating on the price of those assets.

# Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)

# Installation
**Requirements**
* [Node >=18.12.x](https://nodejs.org/en/)
* [PostgreSQL >=14.x](https://www.postgresql.org/download/)

**Dependencies**
* [React + ReactDOM](https://reactjs.org/)
* [MaterialUI](https://mui.com/)
* [NextJS](https://nextjs.org/)
* [axios](https://axios-http.com/)
* [dotenv](https://www.npmjs.com/package/dotenv)
* [express](https://expressjs.com/)
* [pg](https://www.npmjs.com/package/pg)
* [Others](https://www.google.com/search?q=npm+install)

**Dev Dependencies**
* [TypeScript](https://www.typescriptlang.org/)
* [Others](https://www.google.com/search?q=npm+install)

# Usage

## General
1. Run `npm install` from the root directory to install dependencies
1. Copy `example.env` in server dir, rename copy to `.env` ([Reference](#configuration))
2. Copy `config.example.ts` in client dir, rename copy to `config.ts` ([Reference](#configuration))
3. Create an account
4. Create an asset pool for your account
5. Initialize the writer to create contract types and contracts

**More detailed steps TBD**

## Development
1. (Follow general steps)
2. Run `npm run dev` from the server directory
3. Run `npm run dev` from the client directory
4. In browser, open localhost:3001 to view client

## Production
1. TBD

## Scripts

**Client Development**
* `npm run dev` [NextJS] Hosts client in NextJS development mode on port 3001, fast reloads on file save
* `other client scripts` TBD

**Server Development**
* `npm run dev` [Express] Hosts express server on `SV_PORT`, fast reloads on file save
* `other server scripts` TBD

**Production**
* TBD

# Configuration

## Client - Config file (`.ts`) Configuration
* `serverURL` API server URL (default: http://localhost:3000)

## Server - Environment File (`.env`) Configuration
* `SV_PORT` Server port (default: 3000)
* `SV_SECRET` Set to a random string of your choosing
* `PG_HOST` PostgreSQL ip address or domain name
* `PG_PORT` PostgreSQL server port
* `PG_DB` Name of PostgreSQL database to connect to
* `PG_USER` Username of database user
* `PG_PW` Password of database user
* `CL_ORIGIN1` First origin domain for authenticated requests (default: http://localhost:3001)
* `CL_ORIGIN2` Second (if required) origin domain for authenticated requests (default: http://127.0.0.1:3001)
* `CMC_API_URL` API URL for CoinMarketCap, used for realtime crypto market data (default: sandbox creds)
* `CMC_API_KEY` API Key for CoinMarketCap (default: sandbox creds)
* `CC_API_URL` Production API URL for CryptoCompare, used for historical crypto market data
* `CC_API_KEY` Production API Key for CryptoCompare (default: na-na nothing)
