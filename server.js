const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();


const app = express();

const port = process.env.PORT || 80;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/'));

app.get('/', (req, res) => res.render('index'));
app.get('/aboutme', (req, res) => res.render('aboutme'));
app.get('/contacts', (req, res) => res.render('contacts'));
app.get('/albums/:id', (req, res) => res.render('album'));

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);
