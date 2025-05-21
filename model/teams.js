//const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({//schema for the products 
   user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User' // MIGHT RUN INTO K SENSITIVE WHEN TESTING
    },
    document:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Documents' // MIGHT RUN INTO K SENSITIVE WHEN TESTING
    }
})


const teams = mongoose.model('teams', teamSchema);

module.exports = teams;
