const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    supplier_code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    Address_ID: {
        type: mongoose.Types.ObjectId,
        ref: 'Address'
    },
},
{
    timestamps: true
})

const Supplier = new mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;