const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    item_code: {
        type: String,
        required: true,
    },
    item_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    UOM: {
        type: String,
        required: true
    },
    unit_cost: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
})

const Item = new mongoose.model("Item", itemSchema);

module.exports = Item;