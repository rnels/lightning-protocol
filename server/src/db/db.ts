import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PG_HOST as string, // Postgres ip address[s] or domain name[s]
  port: process.env.PG_PORT as any, // Postgres server port[s]
  database: process.env.PG_DB as string, // Name of database to connect to
  user: process.env.PG_USER as string, // Username of database user
  password: process.env.PG_PW  as string// Password of database user
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

console.log('Connected to PostgreSQL pool @ host', process.env.PG_HOST);

export default pool;
