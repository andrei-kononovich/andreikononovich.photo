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
const moment = require('moment');

const Album = require('./models/album');
const Category = require('./models/category');

const dbconfig = require('./config/database');
const passportConfig = require('./config/passport');

mongoose.connect(dbconfig.database);
const db = mongoose.connection;

// check connection anf for errors
db.once('open', () => console.log('Connected to MongoDB'));
db.on('error', (err) => console.log(err));


const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 10000)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    // fileSize: 10
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array('images', 30);

function checkFileType(file, cb) {
  const allowedFileExt = /jpg|jpeg|png|gif/;
  const extname = allowedFileExt.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileExt.test(file.mimetype);

  if (extname && mimeType) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

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

app.get('/', (req, res) => {
  Album.find({}, (err, albums) => {
    if (err) {
      req.flash('error_msg', 'Can not find album!');
      res.redirect('/');
    }
    Category.find({}, (err, categories) => {
      if (err) {
        req.flash('error_msg', 'Can not find category!');
        res.redirect('/');
      }
      res.render('index', {
        albums,
        categories
      });
    });
  });
});

app.get('/aboutme', (req, res) => res.render('aboutme'));

app.get('/contacts', (req, res) => res.render('contacts'));

app.get('/albums/:id', (req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  if(ObjectId.isValid(req.params.id)) {
    Album.findById(req.params.id, (err, album) => {
      if (err) {
        req.flash('error_msg', 'Can not find album!');
        next(err);
      }

      res.render('album', {
        album,
        name: album.name,
        images: album.files
      });
    });
  } else {
    res.redirect('/');
  }
});
app.del('/albums/:id', (req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  if (ObjectId.isValid(req.params.id)) {
    const query = { _id: req.params.id };
    Album.findById(req.params.id, (err, album) => {
      if (err) {
        throw err;
      }
      if (!album) {
        req.flash('error_msg', 'No album!');
        res.status(404).end('No album!');
      }

      if (album._id.toString() === req.params.id) {
        Album.remove(query, (err) => {
          if (err) {
            console.log(err);
            return;
          }
          req.flash('success_msg', 'Album deleted');
          res.send('Success');
        });
      } else {
        res.status(500).end('Can\'t delete!')
      }
    });
  }
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  Album.find({}, (err, albums) => {
    res.render('dashboard', {
      albums,
    })
  });

});

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

app.get('/add-category', ensureAuthenticated, (req, res) => {
  res.render('addCategory');
});
app.post('/add-category', ensureAuthenticated, (req, res) => {
  req.checkBody('catname', 'Category name is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render('addCategory', {
      errors
    });
  } else {
    const tag = req.body.catname.split(' ').join('').toLowerCase();
    const newCategory = new Category({
      name: req.body.catname,
      tag: tag
    });

    newCategory.save((err) => {
      if (err) {
        console.log('Can\'t safe category');
        throw err;
      }

      req.flash('success_msg', 'Category added!');
      res.redirect('/categories');
    });
  }
});

app.get('/categories', /* ensureAuthenticated, */ (req, res) => {
  Category.find({}, (err, categories) => {
    res.render('categories', {
      categories
    });
  });
});
app.del('/categories/:id', (req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  if (ObjectId.isValid(req.params.id)) {
    const query = { _id: req.params.id };
    Category.findById(req.params.id, (err, category) => {
      if (err) {
        throw err;
      }
      if (!category) {
        req.flash('error_msg', 'No category!');
        res.status(404).end('No category!');
      }

      if (category._id.toString() === req.params.id) {
        Category.remove(query, (err) => {
          if (err) {
            console.log(err);
            return;
          }
          req.flash('success_msg', 'Category deleted');
          res.send('Success');
        });
      } else {
        res.status(500).end('Can\'t delete!')
      }
    });
  }
});

app.get('/add-album', ensureAuthenticated, (req, res) => {
  Category.find({}, (err, categories) => {
    res.render('addAlbum', { categories });
  });

});
app.post('/add-album', ensureAuthenticated, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('addAlbum', {
        error: err
      });
    } else {
      if ( req.files.length <= 0 ) {
        res.render('addAlbum', {
          error: 'Error: No file selected!'
        })
      } else {
        req.checkBody('albumname', 'Album name is required').notEmpty();
        req.checkBody('category', 'Album category is required').notEmpty();

        const errors = req.validationErrors();
        if (errors) {
          res.render('addAlbum', {
            errors
          });
        } else {
          const newAlbum = new Album({
            name: req.body.albumname,
            category: req.body.category.toLowerCase(),
            cover: req.files[0].filename,
            files: req.files,
            createdAt: moment(Date.now()).format('DD/MM/YYYY')
          });
          console.log(req.body.category);
          newAlbum.save((err) => {
            if (err) {
              console.log('Can\'t safe album');
              throw err;
            }

            req.flash('success_msg', 'Album added!');
            res.redirect('/dashboard');
          });
        }
      }
    }

  });
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
