const express = require('express');
const req = require('express/lib/request')
const res = require('express/lib/response')
const path = require('path');
const app = express()
const port = 8080

var { mongoose, User, Inventory } = require('./mongo/mongoController');

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('pages/index', {});
});

app.post('/api/createUser', async (req, res) => {
    let data = {
      "userName": req.query.userName,
      "password": req.query.password,
    } 
    User.findOne(data, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result == null){
              var newUser = new User(data);
              newUser.save();
              res.send(newUser);
            } else{
              res.send("User already exists");
            }
          }
    });
});

app.get('/api/login', (req, res) => {
    let data = {
      "userName": req.query.userName,
      "password": req.query.password,
    }
    User.findOne(data, function(err, result){
      if (err) {
        console.log('Error finding user: ', err)
        } else {
          console.log('User Created: ', result)
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.send(JSON.stringify(result))
        }
    })
    });

app.get('/api/getInventory', (req, res) => {
    var uid = req.query.uid;
    var startItem = req.query.startItem;
    var endItem = req.query.endItem;
    User.findOne({"_id": Object(uid)}, function (err, result) {
      if (err) {
          console.log('Error finding user: ', err)
          } else {
            if (result == null) {
              var data =  Inventory.find().limit(10).skip(startItem).limit(endItem);
              res.writeHead(200, {'Content-Type': 'application/json'});
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
    User.findOne({"_id": Object(uid)}, function (err, result) {
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
    User.findOne({"_id": Object(uid)}, function (err, result) {
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
  User.findOne({"_id": Object(uid)}, function (err, result) {
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