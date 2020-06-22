const bodyParser = require('body-parser')
const socket = require("socket.io")
const express = require("express")
const cors = require('cors')
const http = require('http')
const app = express()

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));

let server = http.createServer(app);
app.get('*', () => console.log("**CORS-enabled for any origins**"))

// socket.set('origins', '*:*');
module.exports.io = socket(server)
require('./sockets/shipment.js')

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n *** Server run in port ${port} \n`));