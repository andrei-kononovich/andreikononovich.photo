const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const usersRouter = express.Router();

const router = () => {
  const User = require('../models/user');
  usersRouter.route('/')
    .get((req, res) => {
      User.find({}, (err, users) => {
        // res.render('index');
        res.redirect('/');
      })
    });

  return usersRouter;
};

module.exports = router();
