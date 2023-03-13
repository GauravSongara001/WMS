const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    add_code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        required: true
    },
    address2: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    })

const Address = new mongoose.model('Address', addressSchema);

module.exports = Address;