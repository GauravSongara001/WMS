const mongoose = require('mongoose');

const poSchema = new mongoose.Schema({
    Supplier_ID: {
        type: mongoose.Types.ObjectId,
        ref: 'Supplier'
    },
    PO_number : {
        type: String,
        required: true
    },
    totalPoValue : {
        type: Number,
        required: true,
    },
    details: [{
        lineNo : {
            type: Number,
            required: true,
        },
        Item_ID: {
            type: mongoose.Types.ObjectId,
            ref: 'Item'
        },
        quantity : {
            type: String,
            required: true,
        },
    }]
},
{
    timestamps: true
})

const PO = new mongoose.model("PO", poSchema);

module.exports = PO;