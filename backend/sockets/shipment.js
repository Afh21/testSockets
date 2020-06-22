const { io } = require('../index')
// io.origins('*:*')
// io.set('origins', '*:*');

const fs = require('fs')

const dataShipment = require('../models/shipment.json')

let users = {}

io.on('connection', (client) => {

  client.on('connectUser', (userData, callback) => {
    
    if(!userData && userData.name) {
      return;
    }
    
    users = {...users, [userData.name]: client.id }
    callback(users)

  })


  // Listen client
  client.on('add shipment', (shipment, callback) => {
    console.log("shipment", shipment)

    dataShipment.push(shipment)

    fs.writeFile('./models/shipment.json', JSON.stringify(dataShipment), (err) => {      
      if (err) throw err  


      let lastShipment = dataShipment[dataShipment.length - 1]
      callback({ ok: true, data: lastShipment })
    
    })

  })

  // Listen client
  client.on('offer shipment', newProvider => {

    let shipmentToAffectIndex = dataShipment.findIndex(shipment => shipment.id === newProvider.shipmentID)    
    let shipmentToAffect = dataShipment.find(shipment => shipment.id === newProvider.shipmentID)    
    let shipmentWithOffers = Object.keys(shipmentToAffect).includes('offers') ? shipmentToAffect : { ...shipmentToAffect, offers: [] }
    let isProvidersPresentInOffers = shipmentWithOffers.offers.find(offer => offer.id === newProvider.provider.id)
    let shipmentUpdatedWithProvider = isProvidersPresentInOffers ? shipmentWithOffers : { ...shipmentWithOffers, offers: [ ...shipmentWithOffers.offers, newProvider.provider ]}
    let copyDataShipments = [...dataShipment]

    copyDataShipments.splice(shipmentToAffectIndex, 1, shipmentUpdatedWithProvider)
    
    fs.writeFile('./models/shipment.json', JSON.stringify(copyDataShipments), err => {
      if (err) throw err
      // callback({ ok: true, message: 'Congrats, Offer done successfully!' })

      let userToNotify = users[shipmentToAffect.own.name] 
      client.broadcast.to(userToNotify).emit('new offer', { ok: true })
    })
    

  })

  
  // Send client
  client.emit('list shipments', dataShipment)

  client.on('disconnect', () => console.log("User disconnected!"))

}) 