require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const exphbs  = require('express-handlebars');
const path = require('path');
const expressValidator = require('express-validator');
const flash = require('connect-flash');

const dbconfig = require('./config/database');
const passportConfig = require('./config/passport');

mongoose.connect(dbconfig.database);
const db = mongoose.connection;

// check connection anf for errors
db.once('open', () => console.log('Connected to MongoDB'));
db.on('error', (err) => console.log(err));

// Init App
const app = express();

// Define Port
const port = process.env.PORT || 80;

// Set view engine
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views/layouts'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(__dirname + '/node_modules/'));

// Session MW
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Express messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    const namespace = param.split('.');
    const root = namespace.shift();
    let formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());


app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// ROUTES
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

app.get('/', (req, res) => res.render('index'));
app.get('/aboutme', (req, res) => res.render('aboutme'));
app.get('/contacts', (req, res) => res.render('contacts'));
app.get('/albums/:id', (req, res) => res.render('album'));
app.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard'));

app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => {
    const User = require('./models/user');
    const bcrypt = require('bcryptjs');

    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    req.checkBody('name', 'Full name is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email isn\'t valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirmPassword', 'Confirm password don\'t match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
      res.render('register', {
        errors
      })
    } else {
      let newUser = new User({
        name,
        username,
        email,
        password
      });

      console.log('New User: ', newUser);

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          throw err;
        }

        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }

          newUser.password = hash;
          newUser.save((err) => {
            if (err) {
              console.log('Can\'t safe user');
              throw err;
            }

            req.flash('success_msg', 'You\'re now registered and can log in');
            res.redirect('/login');
          });
        });
      })
    }
  });

app.get('/login', (req, res) => res.render('login'));
app.post('/login', passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true, successFlash: true }));

app.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You\'re logged out');
  res.redirect('/login');
});

// Handle 404
app.get('*', (req, res) => res.redirect('/'));


app.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    console.log('FUCKING ERROR');
    process.exit(1);
  }
});

process.on('uncaughtException', function(err){
  console.log('[uncaughtException]: ', err);
  process.exit(1);
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);


function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}
