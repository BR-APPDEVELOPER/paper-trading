const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{type: String, required: true},
    email:{type: String, required:true, unique:true},
    password:{type:String, required:true},
    balance:{type:Number, default: 1000000}
});

const User = mongoose.model("User", userSchema); // Ensure the model name is "User"

module.exports = User;