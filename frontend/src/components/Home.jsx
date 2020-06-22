import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { Button, Radio, Badge, Empty, Select, InputNumber, Input, notification } from 'antd'
import { BellOutlined, ArrowRightOutlined, MailOutlined, EditOutlined, RocketOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

function Home() {
  
  const userStorage = localStorage.getItem('user')
  const socketIO = io('http://localhost:5000/', { forceNew: true })
  const [offer, setOffer] = useState({})
  const [login, setLogin] = useState({})
  const [shipments, setShipments] = useState([])
  const [user] = useState(JSON.parse(userStorage))
  const [isGoodLogin ,setIsGoodLogin] = useState(false)

  useEffect(() => {
    
    socketIO.on('list shipments', (resp) => {
      setShipments(resp)
    })  

    socketIO.emit('connectUser', user, (response) => {
      console.log("user connected ", response)
    })

    return () => {  
      socketIO.disconnect() 
    }

  }, [])
  
  // Login
  const handleSimulateLogin = () => {
    
    if(!login?.id && !login.name) {
      return notification.error({
        message: 'Ups!',
        description: 'You may fill the form, please',
      });
    } else {
      localStorage.setItem('user', JSON.stringify(login)) 
      setIsGoodLogin(true)

      let userToSaveInBackend = {
        user: login,
        room: ''
      }

      socketIO.emit('connectUser', userToSaveInBackend, (response) => {
        console.log("response server ", response)
      })  
    
    }

  }

  const handleUserNameLogin = ({ target }) => setLogin({...login, name: target.value})

  const handleIDLogin = ({ target }) => {
    var pattern = /^\d+$/;

    if(pattern.test(target.value)) {
      setLogin({...login, id: target.value})
    }

    return;
  } 
  
  // Create an offer
  const handleSendOffer = _ => {

    let dataOffer = {
      id: uuidv4(),
      own: JSON.parse(userStorage),
      ...offer
    }

    socketIO.emit('add shipment', dataOffer, (response) => {
      if(response?.ok) {

        console.log("new shipment", response)

        setTimeout(() => {
          notification.success({
            message: 'Excelent!',
            description: 'Shipment created successfully!',
          })
        }, 1000)

      }
    })

  }

  const handleFrom = (value) => setOffer({...offer, from: value })

  const handleTo = (value) => setOffer({...offer, to: value })

  const handleCost = (value) => setOffer({...offer, cost: value})

  // Create do an offer
  const handleDoAnOffer = (shipment) => {
    let offer = {
      shipmentID: shipment.id,
      provider: { ...JSON.parse(userStorage), cost: 30 }      
    }

    socketIO.emit('offer shipment', offer)
  }

  const myNotifications = (shipment) => shipment?.own?.id === JSON.parse(userStorage)?.id ? { count: shipment?.offers?.length } : { }

  return (
    <>
    {
      !isGoodLogin && !user
      ?
        <>
          <Input onChange={handleUserNameLogin} placeholder='Introduce your name'/>
          <br/>
          <Input onChange={handleIDLogin} placeholder='Introduce your ID' />
          <br/>
          <Button onClick={handleSimulateLogin}> <RocketOutlined /> Login </Button>
        </>
      :
        <>
          <div className="order-list">
          {
            shipments.length ? shipments?.map(shipment => (
              <div key={Math.floor(Math.random() * 999999)} className="order-list__item">
                <div className="order-header">
                  <div className="order-from">{shipment.from}</div> <ArrowRightOutlined />
                  <div className="order-to">{shipment.to}</div>
                  <div className="order-cost">$ {shipment.cost}</div>
                </div>
                <div className="order-footer">
                <Radio.Group value={'default'}>
                  <Radio.Button><EditOutlined /> &nbsp; Details </Radio.Button>
                  <Radio.Button><MailOutlined /> &nbsp; Messages</Radio.Button>
                  <Badge {...myNotifications(shipment)}>
                    <Radio.Button 
                      value="small" 
                      onClick={() => handleDoAnOffer(shipment)} 
                      disabled={shipment?.own?.id === JSON.parse(userStorage)?.id }
                    >
                        <BellOutlined /> Offerts
                    </Radio.Button>                  
                  </Badge>
                </Radio.Group>
                <div style={{ fontWeight: 'bold'}}>
                  @{ shipment?.own?.name }
                </div>
                </div>
              </div>
            )) : <Empty description="Create an offer" />
          }
          </div> 
          <div className="order-footer">
            <Select placeholder="Select Origin" onChange={handleFrom}>
              <Option value="New York">New York, NY</Option>
              <Option value="Miami">Miami, FL</Option>
              <Option value="Orlando">Orlando, FL</Option>
            </Select>

            <Select placeholder="Select Destiny" onChange={handleTo}>
              <Option value="New York">New York, NY</Option>
              <Option value="Miami">Miami, FL</Option>
              <Option value="Orlando">Orlando, FL</Option>
            </Select>

            <InputNumber min={1} max={100} defaultValue={1} onChange={handleCost} />
            <Button onClick={handleSendOffer} disabled={Object.keys(offer).length < 3}> <RocketOutlined /> Create Offer </Button>
            <br/> <br/> <br/>                  

          </div> 
        </>
    }
  </>
  )
}

export default Home
