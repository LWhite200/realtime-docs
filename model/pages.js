//const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({//schema for the products 
    text:{
        type: String,
        required: true
    },
      Sequence:{
        type: number,
        required: true
    },
    document:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Documents' // MIGHT RUN INTO K SENSITIVE WHEN TESTING
    }
})


const pages = mongoose.model('pages', pageSchema);

module.exports = pages;
