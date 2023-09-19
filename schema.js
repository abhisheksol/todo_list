const { text } = require('express');
const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/testing")

mongoose.pluralize(null)
mongoose.connect(process.env.MONGO_URI) 
const sch = mongoose.Schema({
    name: String,
    email: String,
    password: String, 

    items: [{ arraydata: { type: String } }]
})

module.exports = mongoose.model("todotesting", sch)
