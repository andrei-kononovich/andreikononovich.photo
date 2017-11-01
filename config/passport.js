const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const dbconfig = require('./database');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
  passport.use(new LocalStrategy((username, password, done) => {
    const query = { username: username };
    User.findOne(query, (err, user) => {
      if (err) {
        throw err;
      }

      if (!user) {
        return done(null, false, { message: 'No user found' })
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          throw err;
        }

        if (isMatch) {
          return done(null, user);
        } else {
          console.log('Wrong password');
          return done(null, false, { message: 'Wrong password' })
        }
      });
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    })
  });
};
