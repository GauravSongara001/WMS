const Address = require('../model/address')
const Supplier = require('../model/supplier')
const Item = require('../model/item')
const Po = require('../model/po')

exports.addNewItem = async (req, res) => {
    try {
        let itemTotal = await Item.find();
        let prefixCount = (number, length) => String(number).padStart(length, '0');
        var itemCode = "I" + prefixCount(itemTotal.length + 1, 3)

        const addItem = new Item({
            item_code: itemCode,
            item_name: req.body.item_name,
            description: req.body.description,
            UOM: req.body.UOM,
            unit_cost: req.body.unit_cost
        });
        const addedItem = await addItem.save()

        res.json({
            title: "item added successfully",
            message: addedItem
        })

    } catch (error) {
        res.status(400).json(`${error}`)
    }
}

exports.getAllItems = async (req,res) => {
    try {
        const items = await Item.find();
        res.json(items)
    } catch (error) {
        res.status(400).json(`${error}`)
    }
}

exports.addNewAddress = async (req, res) => {
    try {
        let addTotal = await Address.find();
        let prefixCount = (number, length) => String(number).padStart(length, '0');
        var addCode = "A" + prefixCount(addTotal.length + 1, 3)

        const addAddress = new Address({
            add_code: addCode,
            name: req.body.name,
            state: req.body.state,
            country: req.body.country,
            address1: req.body.address1,
            address2: req.body.address2
        });
        const added = await addAddress.save();
        res.json(added);
    } catch (error) {
        res.status(400).json(error)
        console.log(error);
    }
}

exports.getAllAddress = async (req,res) => {
    try {
        const addressCode = await Address.find().select({add_code: 1, _id: 0});
        res.json(addressCode);
        console.log("add_code....", addressCode);
    } catch (error) {
        res.status(400).json(`${error}`)
        console.log(error);
    }
}

exports.addNewSupplier = async (req, res) => {
    try {
        const address = await Address.findOne({ add_code: req.body.address_code });
        const addressId = address._id.toString()

        let supplierTotal = await Supplier.find();
        let prefixCount = (number, length) => String(number).padStart(length, '0');
        var supplierCode = "S" + prefixCount(supplierTotal.length + 1, 3)

        const addSupplier = new Supplier({
            supplier_code: supplierCode,
            name: req.body.name,
            description: req.body.description,
            Address_ID: addressId,
        })

        const addedSupplier = await addSupplier.save();
        res.json(addedSupplier);
        count++;
    } catch (error) {
        res.status(400).json(`${error}`)
        console.log(error);
    }
}

exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.aggregate([
            {
                "$lookup":
                {
                    "from": "addresses",
                    "localField": "Address_ID",
                    "foreignField": "_id",
                    "as": "address",
                }
            }
        ])
        res.send(suppliers);
        console.log(suppliers);
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.addPODetails = async (req, res) => {
    try {
        let poTotal = await Po.find();
        let prefixCount = (number, length) => String(number).padStart(length, '0');
        var poCode = "PO" + prefixCount(poTotal.length + 1, 3)

        const supplier = await Supplier.findOne({ supplier_code: req.body.supplier_code });
        const supplier_id = supplier._id.toString();

        const detailsArr = [];
        const details = req.body.details;

        for (let i = 0; i < details.length; i++) {
            const item = await Item.findOne({ item_code: details[i].item_code });
            detailsArr.push({
                lineNo: i + 1,
                Item_ID: item._id.toString(),
                quantity: details[i].quantity,
                unit_cost: item.unit_cost,
            })
        }

        let sum = 0;
        const totalCost = [];
        detailsArr.map((elem) => {
            return totalCost.push((elem.quantity * elem.unit_cost))
        })

        totalCost.forEach(elem => {
            return sum += elem;
        })

        const addPO = new Po({
            Supplier_ID: supplier_id,
            PO_number: poCode,
            totalPoValue: sum,
            details: detailsArr
        });
        const savedPO = await addPO.save();
        res.json(savedPO);
    } catch (error) {
        res.status(400).json(error)
        console.log(error);
    }
}

exports.getPODetails = async (req,res) => {
    try {
        let match = {};

        const po = await Po.find();
        const limit = Number(req.query.limit) || 5;
        const page = Number(req.query.page) || 1;

        if (req.query.po || req.query.supplier || req.query.item) {
            let arr = [];

            if (req.query.po) {
                arr.push({PO_number: new RegExp(req.query.po, "i")})
            }
            if (req.query.supplier) {
                arr.push({"supplier_details.supplier_code": new RegExp(req.query.supplier, "i")})
            }
            if (req.query.item) {
                arr.push({"item_details.item_code": new RegExp(req.query.item, "i")})
            }

            match.$and = arr
        }

        const skip  = (limit * page) - limit;

        const countPage = await Po.aggregate([
            {
                "$lookup":
                {
                    "from": "suppliers",
                    "localField": "Supplier_ID",
                    "foreignField": "_id",
                    "as": "supplier_details",
                },
            },
            {
                "$lookup":
                {
                    "from": "items",
                    "localField": "details.Item_ID",
                    "foreignField": "_id",
                    "as": "item_details",
                },
            },
            {
                "$unwind" : "$details"
            },
            {
                "$unwind" : "$item_details"
            },
            {
                "$unwind" : "$supplier_details"
            },
            {
                "$match" : {"$expr" : {
                    "$eq" : ["$item_details._id", "$details.Item_ID"],
                }}
            },
            { "$match": match},
            {
                $facet: {
                    data: [{ $skip : skip}, {$limit: limit}],
                    dataInfo : [ {$group: {_id: null, count : {$sum: 1}}}]
                }
            },
            {
                $project: {
                    _id: 0,
                    docs : "$data",
                    total: { $first : "$dataInfo.count"}
                }
            }
        ])

        const npage = Math.ceil(countPage[0].total / 5)

        res.json({npage, poData: countPage[0].docs});
    } catch (error) {
        res.status(400).send(error)
        console.log(error);
    }
}

exports.updatePODetails = async (req,res) => {
    try {
        const _id = req.params.id;

        const poDetails = await Po.findOne({_id: _id});

        console.log("poDetails............", poDetails);

        const supplier_id = poDetails.Supplier_ID;

        const supplier_code = await Supplier.findOne({_id: supplier_id}).select({supplier_code: 1, _id: 0})

        const details = req.body.details;

        console.log("Details from purchase order....", details);
        const detailsArr = [];

        console.log();

        for (let i = 0; i < details.length; i++) {
            const item = await Item.findOne({ item_code: details[i].item_code });

            console.log(details[i].item_code);

            console.log("Item data???????????", item);
            detailsArr.push({
                lineNo: i + 1,
                Item_ID: item._id.toString(),
                quantity: details[i].quantity,
                unit_cost: item.unit_cost,
            })
        }

        let sum = 0;
        const totalCost = [];
        detailsArr.map((elem) => {
            return totalCost.push((elem.quantity * elem.unit_cost))
        })

        totalCost.forEach(elem => {
            return sum += elem;
        })

        await Po.updateOne({_id: _id}, {
            $set: {
                details: detailsArr
            }
        })

        const updatePO = await Po.findByIdAndUpdate({_id: _id}, {
            Supplier_ID: supplier_id,
            totalPoValue: sum
        })

        res.json(updatePO);

        console.log(updatePO);
    } catch (error) {
        res.status(400).json(`${error}`)
        console.log(error);
    }
}