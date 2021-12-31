const mongoose = require('mongoose')
const uri = ""; // add mongo URL
mongoose.connect(uri)

var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Successful connection to " + uri)
});

// Schema 部分，會考，要背
var UserSchema = mongoose.Schema({
    uid: {type: String, required: true},
    userName: {type: String, required: true},
    password: {type: String, required: true},
})

var inventorySchema = mongoose.Schema({
    inventory_id: {type: String},
    name: {type: String, required: true},
    type: {type: String},
    quantity: {type: Number},
    photo: {type: String},
    photo_mine: {type: String},
    inventory_address: {type: Object},
    manager: {type: String, required: true},
});

var User = mongoose.model('account_info', UserSchema);
var Inventory = mongoose.model('inventory', inventorySchema);

module.exports = {mongoose, User, Inventory}