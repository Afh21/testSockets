const router = require('express').Router();

const { getAllShipments } = require('../controllers/shipment')

router.get("/", getAllShipments)

module.exports = router;