import dotenv from 'dotenv';
dotenv.config();
import app from './app';

app.listen(process.env.SV_PORT);
console.log(`Server listening on port ${process.env.SV_PORT}`);
