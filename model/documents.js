//const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({//schema for the products 
    docName:{
        type: String,
        required: true
    },
    Pages:{
        type: Number,
        required: true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})


const documents = mongoose.model('documents', documentSchema);

module.exports = documents;
