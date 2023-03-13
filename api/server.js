const express = require('express');
const cors = require('cors')
const app = express();

const port = 8000;

const router = require('./routes/userRouter')
require('./db/conn');

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(router)
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: false,
//     exposedHeaders: ['set-cookie']
// }))

app.listen(port, () => {
    console.log(`Listening to port: ${port}`);
})