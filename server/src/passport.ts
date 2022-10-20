import * as model from './models/accountModel';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { User } from './types';

export default function createPassport(passport: any) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      model
        ._getAccountAuthByEmail(email)
        .then((accountAuth) => {
          bcrypt
            .compare(password, accountAuth.passwordHash)
            .then((res: any) => {
              let loggedUser: User = {
                id: accountAuth.accountId as number
              }
              if (res) return done(null, loggedUser);
              else return done(null, false, { message: "Password incorrect" });
            })
            .catch((err: any) => done(err));
        })
        .catch((err: any) => done({ message: 'That email is not registered' }));
    })
  );
  passport.serializeUser((user: any, done: any) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done: any) => {
    return done(null, user);
  });
};
