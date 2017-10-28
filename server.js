var express = require('express');
var app = express();
var port = process.env.PORT || 80;

app.use(express.static('./'));

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);
