var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// --> 7)  Mount the Logger middleware here
app.get("/", (req,res)=>{
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname + '/public'))
// --> 11)  Mount the body-parser middleware  here


/** 1) Meet the node console. */


/** 2) A first working Express Server */


/** 3) Serve an HTML file */


/** 4) Serve static assets  */


/** 5) serve JSON on a specific route */


/** 6) Use the .env file to configure the app */
 
 
/** 7) Root-level Middleware - A logger */
//  place it before all the routes!

/** 8) Chaining middleware. A Time server */


/** 9)  Get input from client - Route parameters */
app.get('/api/timeset/:word?', (req, res, next) => {
  //console.log('hola');
  //var timeset = req.params.timeset;
  //if word is onli number it`s format unix, else it`s format UTC, else invalit date
  var word = req.params.word;
  var boolWord = true;
  
  if(word == null){
    req.time = new Date();
  }
  else{
    if(/[^0-9]/.test(word)){
      req.time = new Date(word);
    }
    else{req.time = new Date(Number(word));}
  }
  //req.time = new Date(Number(word) != NaN ? Number(word):word );
  var resObject = {};
  if(req.time.toUTCString() != "Invalid Date"){
    resObject={"unix": req.time.getTime(),"utc": req.time.toUTCString()};
  } //"error": req.time.toUTCString()}:
  else if(req.time.toUTCString() == "Invalid Date"){
    resObject={"error":"Invalid Date"}
  } 
  res.json(resObject);
  next();
})

/** 10) Get input from client - Query parameters */
// /name?first=<firstname>&last=<lastname>

  
/** 11) Get ready for POST Requests - the `body-parser` */
// place it before all the routes !

//app.use(bodyParser.urlencoded({extended: false}))
/** 12) Get data form POST  */

// This would be part of the basic setup of an Express app
// but to allow FCC to run tests, the server is already active
/** app.listen(process.env.PORT || 3000 ); */

//---------- DO NOT EDIT BELOW THIS LINE --------------------

 module.exports = app