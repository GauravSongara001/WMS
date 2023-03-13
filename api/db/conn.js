const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/PO_CRUD')
.then(() => console.log('Database connected Successfully'))
.catch((err) => console.log(err))