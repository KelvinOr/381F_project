const express = require('express');
const { redirect } = require('express/lib/response');
const path = require('path');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express()
const port = process.env.PORT || 8080;

var { mongoose, User, Inventory } = require('./MongoController');
const req = require('express/lib/request');
const res = require('express/lib/response');

app.set('view engine', 'ejs') // EJS 

app.use(express.static(__dirname + '/public')); // 設置靜態檔案路徑
app.use(bodyParser.json({limit: '50mb'})); // 設置解析JSON的中介
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // 設置解析URL的中介

// init page
app.get('/', (req, res) => {
  res.render('pages/index', {});
});

// login page
app.get('/login', (req, res) => {
  res.render('pages/login', {});
});

// register page
app.get('/signup', (req, res) => {
  res.render('pages/signup', {});
});

// home page
app.get('/Home', (req, res) => {
  var uid = req.query.uid;
  var startItem = req.query.startItem;
  if (startItem == undefined || Number.isInteger(parseInt(startItem)) == false) {
    startItem = 0;
  }

  // mongo db 操作, 操作方法同一般MongoDB 一樣
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
                  if (dataresult.length > 10) {
                    var res_data = [];
                    for (var i = 0; i < 10; i++) {
                        res_data.push(dataresult[i]);
                    }
                    res.render('pages/Home', {data: res_data, start: startItem, moreItem: true});
                  } else{
                    res.render('pages/Home', {data: dataresult, start: startItem, moreItem: false});
                  }
                }
              } else{
                res.render('pages/Home', {data: [], start: startItem});
              }
              console.log(startItem);
              
            }).skip(parseInt(startItem)).limit(11);

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

app.get('/search' ,(req, res) => {
  var search = req.query.search;
  if (search == undefined) {
    Inventory.find({}, {_id: 1, name: 1, inventory_id: 1 }, function(err, dataresult) {
      if (dataresult.length > 0) {
        if (dataresult[0].inventory_id == null) {
          res.render('pages/Search', {data: []});
        } else {
          res.render('pages/Search', {data: dataresult});
        }
      } else{
        res.render('pages/Search', {data: []});
      }
      console.log(dataresult);
      console.log(search);
    }).limit(200);
  } else{
    Inventory.find({"name": {$text: {$search: search}}}, function (err, dataresult) {
      if (dataresult.length > 0) {
        if (dataresult[0].inventory_id == null) {
          res.render('pages/Search', {data: []});
        } else {
          res.render('pages/Search', {data: dataresult});
        }
      } else{
        res.render('pages/Search', {data: []});
      }
      console.log(dataresult);
    });
  } 
});

app.get('/map', (req, res) => {
  res.render('pages/map', {lat : req.query.lat, lot: req.query.lot});
})

//start api
app.post('/api/createUser', (req, res) => {
    // 呢到既 req.body 期實可以直接用，佢本身就係個JSON 下面既api 都一樣
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
          if (result){
            var userInfo = result.uid.toString();
            res.render('pages/auth', {uid: userInfo});
          } else{
            res.send("User not found");
          }
          
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
        "coord": {
          "lot": req.body.longitude,
          "lat": req.body.latitude,
        }
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
              res.redirect('/Home?uid=' + result.uid.toString() + 'startItem=10');
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
                    if (update_result){
                      res.redirect('/Home?uid=' + uid);
                    }
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


//RUSTful

//RUSTful api ：之後既就係參數
app.get('/api/inventory/name/:name', (req, res) => {
    var inventory_name = req.params.name; //取得參數
    Inventory.find({name: inventory_name}, {}, function(err, dataresult) {
      if (err){
        res.status(500).send({err: err});
      } else{
        if (dataresult.length > 0) {
          res.status(200).send({massage: dataresult});
        } else{
          res.status(200).send({massage: "no Item"});
        } 
      }
    })
})

app.get('/api/inventory/type/:type', (req, res) => {
  var inventory_type = req.params.type;   //取得參數
  Inventory.find({name: inventory_type}, {}, function(err, dataresult) {
    if (err){
      res.status(500).send({err: err});
    } else{
      if (dataresult.length > 0) {
        res.status(200).send({massage: dataresult});
      } else{
        res.status(200).send({massage: "no Item"});
      } 
    }
  })
})

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