const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const assert =require('assert');
const cors = require('cors');
const shortid = require('shortid');
const mongoose = require('mongoose');
var env = require('node-env-file'); // .env file
env(__dirname + '/.env');

mongoose.connect(process.env.MONGO_URI , {useNewUrlParser: true, useUnifiedTopology: true})
var Schema = mongoose.Schema;
//0zakcS-y
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const UserSchema= new Schema({ 
  username: String,
  _id: String,
  dataExe: Array
});
var UsersBoxSchema = new Schema({users: Array, password: String});

mongoose.set('useFindAndModify', false);//

const UsersBox = mongoose.model("UsersBox", UsersBoxSchema);
const UserBox =  mongoose.model("UserBox", UserSchema);
/*
UserBox.remove({username:'tovar'}, (err, doc)=>{
  if(err) console.error(err, 'not eliminate');
  console.log(doc, 'has been remove');
})
*/
app.post("/api/exercise/new-user", function (req, res){
  var username = req.body.username;
  let id = shortid.generate();
  let data = {username: username, _id: id, dataExe: Array}
  UserBox.findOne({username: username}, (err, doc)=>{
    //console.log(data+ ' '+ 'HHHHH');
    if(err){
      res.send('Checking you username failed. Try again');
      console.error(err);
    }
    if(!doc){
      UsersBox.findOne({password: 'arrUsers'}, (err, doc)=>{
        if(err) console.error(err+'errUsersBox');
        if(!doc){
          var arrUsers = new UsersBox({password: 'arrUsers'});
          arrUsers.save((err, doc)=>{
            if(err) console.error(err+ 'errSavingUsersBox');
          });
        }
      })
      var newUser = new UserBox(data);
      newUser.save(function(err, doc){
        var User = {username: doc.username, _id: doc._id, __v: doc.__v};
        if(err){
          res.send('The Username and UserId could not be saved')
          console.error(err);
        }
        UsersBox.findOneAndUpdate({password: 'arrUsers'},{$push :{users: User}},{new: true}, (err, data)=>{
          if(err) console.error(err+ 'errUpdatingUsers');
          console.log(data+'   '+'arrUpdated');
        })
        res.send(User);
      });
      
    }
    else{
      console.log(doc);
      res.send('username already taken')
    }
  })
  //console.log(username);
  //next();
});
/*
var AddSchema = new mongoose.Schema({
"username":{type:String,required:true},
  "description":{type:String,required:true},
  "duration":{type:Number,required:true},
  "_id":String,
  "date":Date
})

const AddUser = mongoose.model('AddUser', AddSchema)
*/
app.post("/api/exercise/add", function (req, res){
  let query = req.body.userId;
  var date = req.body.date;
  if(date == null){
    req.time = new Date();
  }
  else{
    if(/[^0-9]/.test(date)){
      req.time = new Date(date);
    }
    else{req.time = new Date(Number(date));}
  }
  //console.log(req.time.toDateString())
  //let data = {username: '', _id:req.body.userId, description: req.body.description, duration: req.body.duration, date: date }
  //console.log(userId, description);
  //console.log(Number(req.body.duration).toString()== 'NaN');
  if(req.body.description=='') {res.send('Path `description` is required.');}
  else if(req.body.duration =='' || Number(req.body.duration).toString()== 'NaN'){
    if(req.body.duration==''){res.send('Path `duration` is required.');}
    else if(Number(req.body.duration).toString()=='NaN'){res.send('Cast to Number failed for value ' + req.body.duration+' at path "duration"')}
  }
  else{
    //hay un error en la llamada a findOne ya que no me esta encontrando ningun usuario
    UserBox.findOne({_id:query}, (err, doc) =>{
      if(err) res.send('could not be found!');
      else{
        let dat = {description: req.body.description, duration: req.body.duration, date: req.time.toDateString()};
        if(doc){
          //console.log('HHHH', doc)
          doc.dataExe.push(dat);
          doc.save((err, doc)=>{
            if(err) res.send('error to saved dataExec');
            res.send({username:doc.username, _id: doc._id, description: dat.description, duration: dat.duration, date: dat.date});
          })
        }
        else{res.send('Invalid Id');}
      }
      
    })
  }
});

app.get("/api/exercise/log?", (req, res, next) =>{
  var userId = req.query.userId;
  var from = req.query.from;
  var to = req.query.to;
  var limit = req.query.limit;
  //tenemos toda la data del usuario y las sesiones a recuperar en UserSchema.dataExe
  //console.log(UserBox.dataExe);
  if(from == null){
    req.time = new Date();
  }
  else{
    if(/[^0-9]/.test(from)){
      req.time = new Date(from);
    }
    else{req.time = new Date(Number(from));}
  }
  if(/[^0-9]/.test(to)){
    var toTime = new Date(to);
  }
  else{var toTime = new Date(Number(to));}
  console.log(userId, from, to, limit, req.time.toDateString(), Date.parse(req.time.toDateString()));
  UserBox.findOne({_id: userId}, (err, doc)=>{
    if(err) res.send('could not be found!');
    if(doc){
      if(from==null || from=='' ||from ==undefined){
        res.send(doc);
      }
      else{
        var log=[];
        if(from && !to && !limit){
          log = doc.dataExe.filter((val, i) =>{
            console.log('from');
            return Date.parse(val.date) >= Date.parse(req.time.toDateString())
          })
          res.send({username: doc.username, _id: doc._id,from: req.time.toDateString(), count: log.length, log})
        }
        else if(from && to && !limit){
          log = doc.dataExe.filter((val, i) =>{
            return Date.parse(val.date) >= Date.parse(req.time.toDateString());
          }).filter((val,i)=>{
            console.log('to')
            return Date.parse(val.date) <= Date.parse(toTime.toDateString());
          })
          res.send({username: doc.username, _id: doc._id,from: req.time.toDateString(), to: toTime.toDateString(), count: log.length, log})
        }
        else{
          if(limit <=0){limit=1}
          console.log('fffff')
          log = doc.dataExe.filter((val, i) =>{
            return Date.parse(val.date) >= Date.parse(req.time.toDateString());
          }).filter((val,i)=>{
            console.log('limit')
            return Date.parse(val.date) <= Date.parse(toTime.toDateString());
          }).splice(0, limit);
          res.send({username: doc.username, _id: doc._id,from: req.time.toDateString(), to: toTime.toDateString(), count: log.length, log})
        }
        //res.send({username: doc.username, _id: doc._id,from: req.time.toDateString(), count: log.length, log})
      }
    }
    else{res.send('unknown userId')}
  })
  next();
})

app.get("/api/exercise/:users?", (req, res, next) =>{
  var userStr = req.params.users;
  if(userStr == 'users'){
    UsersBox.findOne({password: 'arrUsers'}, (err, doc)=>{
      if(err) console.error(err);
      //res.send(doc);
      res.send(doc.users);
      next();
    })
  }
})


// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
