# LIGHTNING PROTOCOL ⚡
It's possible this is the end all of financial derivative trading.

# Table of Contents
* [Installation](#installation)
* [Usage](#usage)

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
If you want to try the app, you need to do 3 things:
1. Create an account
2. Create an asset pool
3. Initialize the writer to create contract types and contracts

I'll leave the figuring out to you.

## Development
1. Run `npm install` from the root directory to install dependencies
2. Copy `example.env`, rename copied file to `.env` and fill out accordingly for both client and server
3. Run `npm run dev` from the server directory
3. Run `npm run dev` from the client directory
4. In browser, open localhost:3001 to view client

## Production
1. Why do you need to know?

## Client - Config file (`.ts`) Configuration
* `serverURL` API server URL (default: http://localhost:3000)

## Server - Environment File (`.env`) Configuration
* `SV_PORT` Server port (default: 3000)
* `SV_SECRET` Just leave it as is, but if you want you can set it to a random string of your choosing
* `PG_HOST` PostgreSQL ip address[s] or domain name[s]
* `PG_PORT` PostgreSQL server port[s]
* `PG_DB` Name of PostgreSQL database to connect to
* `PG_USER` Username of database user
* `PG_PW` Password of database user
* `CL_ORIGIN1` First origin domain for authenticated requests
* `CL_ORIGIN2` Second (if you need it) origin domain for authenticated requests
* `CMC_API_URL` API URL for CoinMarketCap, used for realtime crypto market data (default: sandbox creds)
* `CMC_API_KEY` API Key for CoinMarketCap (default: sandbox creds)
* `CC_API_URL` API URL for CryptoCompare, used for historical crypto market data (default: na-na nothing)
* `CC_API_KEY` API Key for CryptoCompare (default: still nothing, and no there's no sample data)


## Scripts

**Client Development**
* `npm run dev` [NextJS] Hosts client in NextJS development mode on port 3001, fast reloads on file save
* `other client scripts` Don't worry about it

**Server Development**
* `npm run dev` [Express] Hosts express server on `SV_PORT`, fast reloads on file save
* `other server scripts` I'll get to it

**Production**
* Again, no.
