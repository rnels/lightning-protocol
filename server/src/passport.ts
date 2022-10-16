import * as model from './models/accountModel';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { Account, User } from './types';

export default function createPassport(passport: any) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      model
        .getAccountAuthByEmail(email)
        .then((accountRes: any) => {
          if (accountRes.rows.length === 0) {
            return done(null, false, {
              message: "That email is not registered",
            });
          }
          let account: Account = {
            accountId: accountRes.rows[0].account_id,
            email: accountRes.rows[0].email,
            passwordHash: accountRes.rows[0].pw_hash,
            firstName: accountRes.rows[0].first_name,
            lastName: accountRes.rows[0].last_name
          };
          bcrypt
            .compare(password, account.passwordHash)
            .then((res: any) => {
              let loggedUser: User = {
                id: account.accountId as number
              }
              if (res) return done(null, loggedUser);
              else return done(null, false, { message: "Password incorrect" });
            })
            .catch((err: any) => done(err));
        })
        .catch((err: any) => done(err));
    })
  );
  passport.serializeUser((user: any, done: any) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done: any) => {
    return done(null, user);
  });
};
