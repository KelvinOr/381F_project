const mongoose = require('mongoose')
const uri = "mongodb+srv://admin:admin@cluster0.0gaek.mongodb.net/server_side_project?retryWrites=true&w=majority";
mongoose.connect(uri)

var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Successful connection to " + uri)
});

var UserSchema = mongoose.Schema({
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