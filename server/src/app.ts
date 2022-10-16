import routers from './routes';
import express  from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import createPassport from './passport';
createPassport(passport);

const app = express();
app.use(compression());
app.use(cors({ origin: [process.env.CL_ORIGIN1 as string, process.env.CL_ORIGIN2 as string], credentials: true }));
app.use(cookieParser(process.env.SV_SECRET));
app.use(express.json());
app.use(
  session({
    secret: process.env.SV_SECRET as string,
    name: 'lightning-app-cookie',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  })
);
app.use(passport.initialize());
app.use(passport.session());

for (let router of Object.values(routers)) {
  app.use(router);
}

export default app;
