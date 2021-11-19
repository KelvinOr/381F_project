const express = require('express');
const { redirect } = require('express/lib/response');
const path = require('path');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express()
const port = 8080

var { mongoose, User, Inventory } = require('./mongo/mongoController');
const req = require('express/lib/request');
const res = require('express/lib/response');

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/', (req, res) => {
  res.render('pages/index', {});
});

app.get('/login', (req, res) => {
  res.render('pages/login', {});
});

app.get('/signup', (req, res) => {
  res.render('pages/signup', {});
});

app.get('/Home', (req, res) => {
  var uid = req.query.uid;
  var startItem = req.query.startItem;
  if (startItem == undefined) {
    startItem = 0;
  }

  User.findOne({uid: uid}, function (err, result) {
    if (err) {
        console.log('Error finding user: ', err)
        } else {
          if (result != null) {
            Inventory.find({}, {_id: 1, name: 1, inventory_id: 1 }, function(err, dataresult) {
              if (dataresult.length > 0) {
                if (dataresult[0].inventory_id == null) {
                  res.render('pages/Home', {data: [], start: startItem});
                } else {
                  res.render('pages/Home', {data: dataresult, start: startItem});
                }
              } else{
                res.render('pages/Home', {data: [], start: startItem});
              }
            }).skip(Number(startItem)).limit(10);
            
          } else {
            res.send('No User');
          }
        }
  });
});

app.get('/addItem', (req, res) => { 
  res.render('pages/insertItem', {});
});

app.get('/viewItem', (req,res) => {
  var inventory_id = req.query.oid;
  Inventory.findOne({"inventory_id": inventory_id}, function (err, result) {
    if (err) {
        console.log('Error finding item: ', err)
        res.redirect('/');
        } else {
          if (result != null) {
            console.log(result);
            res.render('pages/viewItem', {data: result});
          } else {
            res.redirect('/');
          }
        }
  });
});

app.get('/editItem', (req,res) => {
  var inventory_id = req.query.oid;
  Inventory.findOne({"inventory_id": inventory_id}, function (err, result) {
    if (err) {
        console.log('Error finding item: ', err)
        res.redirect('/');
        } else {
          if (result != []) {
            res.render('pages/editItem', {data: result});
          } else {
            res.redirect('/');
          }
        }
  });
});

//start api
app.post('/api/createUser', (req, res) => {
    let data = {
      "uid": mongoose.Types.ObjectId().toString(),
      "userName": req.body.userName,
      "password": req.body.password
    } 
    if (data.userName != null && data.password != null) {
      User.findOne(data, function (err, result) {
        if (err) {
            console.log('Error finding user: ', err)
            } else {
              if (result == null){
                var newUser = new User(data);
                newUser.save();
                res.redirect('/login');
              } else{
                res.send("User already exists");
              }
            }
      });
    } else {
      res.send("Please enter a username and password"); 
    }
});

app.get('/api/login', (req, res) => {
    let data = {
      "userName": req.query.userName,
      "password": req.query.password,
    }
    User.findOne(data, {uid:1, _id:0}, function(err, result){
      if (err) {
        console.log('Error finding user: ', err)
        } else {
          console.log('User found: ', result)
          var userInfo = result.uid.toString();
          res.render('pages/auth', {uid: userInfo});
        }
    })
    
});

app.get('/api/getInventoryOne', (req, res) => {
  var uid = req.query.uid;
  var itemid = req.query.itemid;
  User.findOne({"uid": uid}, function (err, result) {
    if (err) {
        console.log('Error finding user: ', err)
        } else {
          if (result == null) {
            var data =  Inventory.findOne({"_id": Object(itemid)});
            res.send(JSON.stringify(data));
          } else {
            res.send('Please Login');
          }
        }
  });
});

app.post('/api/addInventory', (req, res) => {
    var uid = req.body.uid;
    var inventoryItem = {
      "inventory_id": mongoose.Types.ObjectId().toString(),
      "name": req.body.name,
      "type": req.body.type,
      "quantity": req.body.quantity,
      "photo": req.body.photo,
      "photo_mine": req.body.photo_mine,
      "inventory_address": {
        "street": req.body.street,
        "building": req.body.building,
        "country": req.body.country,
        "zipcode": req.body.zipcode,
        "coord": req.body.coord
      },
      "manager": req.body.manager,
    }

    User.findOne({"uid": uid}, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result != null) {
              var newInventory = new Inventory(inventoryItem);
              newInventory.save();
              res.redirect('/Home?uid=' + result.uid.toString());
            } else {
              res.send('Please Login');
            }
          }
    });
});

app.post('/api/updateInventory', (req, res) => {
    var uid = req.body.uid;
    var inventoryItem = req.body;
    delete inventoryItem["uid"];
    User.findOne({"uid": uid}, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result != null) {
              Inventory.findOneAndUpdate({"inventory_id": req.body.inventory_id}, inventoryItem, function(error, update_result){
                if (error) {
                  console.log('Error finding user: ', error)
                  } else {
                    console.log(update_result);
                    res.redirect('/Home?uid=' + uid);
                  }
              });
            } else {
              res.send('Please Login');
            }
          }
    });
});

app.delete('/api/deleteInventory', (req, res) => {
  var uid = req.query.uid;
  var inventory_id = req.query.inventory_id;
  User.findOne({"uid": uid}, function (err, result) {
    if (err) {
        console.log('Error finding user: ', err)
        } else {
          if (result != null) {
            Inventory.deleteOne({"inventory_id": inventory_id}, function(error, del_result){
              if (error) {
                console.log('Error finding user: ', error)
                } else {
                  res.redirect('/Home?uid=' + uid);
                }
            });
          } else {
            res.send('Please Login');
          }
        }
  });
});

/*
  
*/

//404
app.use(function(req,res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

//505
app.use(function(err,req,res,next){
	console.log(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});
//start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})