//const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({//schema for the products 
   username:{
         type: String,
        required: true
    },
    Password:{
         type: String,
        required: true
    }
})


const users = mongoose.model('users', userSchema);

module.exports = users;
