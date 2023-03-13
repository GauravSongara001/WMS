const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');

router.post('/item', userController.addNewItem);
router.get('/item', userController.getAllItems);
router.post('/address', userController.addNewAddress);
router.get('/address', userController.getAllAddress);
router.post('/supplier', userController.addNewSupplier);
router.get('/supplier', userController.getAllSuppliers);
router.post('/add-po', userController.addPODetails);
router.get('/get-po', userController.getPODetails);
router.put('/update-Po/:id', userController.updatePODetails);

module.exports = router;