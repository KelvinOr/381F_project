const express = require('express');
const req = require('express/lib/request');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response')
const path = require('path');
const bodyParser = require('body-parser');
const app = express()
const port = 8080

var { mongoose, User, Inventory } = require('./mongo/mongoController');

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('pages/index', {});
});

app.get('/login', (req, res) => {
  res.render('pages/login', {});
});

app.get('/signup', (req, res) => {
  res.render('pages/signup', {});
});

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

app.get('/api/getInventory', (req, res) => {
    var uid = req.query.uid;
    var startItem = req.query.startItem;
    var endItem = req.query.endItem;
    User.findOne({"uid": uid}, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result == null) {
              var data =  Inventory.find({}, {_id: 1, name: 1}).limit(10).skip(startItem).limit(endItem);
              res.send(JSON.stringify(data));
            } else {
              res.send('Please Login');
            }
          }
    });
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
    var uid = req.query.uid;
    var inventoryItem = {
      "inventory_id": req.query.inventory_id,
      "name": req.query.name,
      "type": req.query.type,
      "quantity": req.query.quantity,
      "photo": req.query.photo,
      "photo_mine": req.query.photo_mine,
      "inventory_address": {
        "street": req.query.street,
        "building": req.query.building,
        "country": req.query.country,
        "zipcode": req.query.zipcode,
        "coord": req.query.coord
      },
      "manager": req.query.manager,
    }
    User.findOne({"uid": uid}, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result == null) {
              var newInventory = new Inventory(inventoryItem);
              newInventory.save();
              res.send(newInventory);
            } else {
              res.send('Please Login');
            }
          }
    });
});

app.post('/api/updateInventory', (req, res) => {
    var uid = req.query.uid;
    var inventoryItem = {
      "inventory_id": req.query.inventory_id,
      "name": req.query.name,
      "type": req.query.type,
      "quantity": req.query.quantity,
      "photo": req.query.photo,
      "photo_mine": req.query.photo_mine,
      "inventory_address": {
        "street": req.query.street,
        "building": req.query.building,
        "country": req.query.country,
        "zipcode": req.query.zipcode,
        "coord": req.query.coord
      },
      "manager": req.query.manager,
    }
    User.findOne({"uid": uid}, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result == null) {
              Inventory.findOneAndUpdate({"inventory_id": req.query.inventory_id}, inventoryItem, function(err, result){
                if (err) {
                  console.log('Error finding user: ', err)
                  } else {
                    res.send(result);
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
          if (result == null) {
            Inventory.deleteOne({"_id": inventory_id}, function(err, result){
              if (err) {
                console.log('Error finding user: ', err)
                } else {
                  res.send(result);
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