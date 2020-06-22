import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import addNotification from 'react-push-notification'

function User () {
  
  const socketIO = io('http://localhost:5000/', { forceNew: true })
  const userStorage = localStorage.getItem('user')
  const [user] = useState(JSON.parse(userStorage))
  const audioRef = useRef(null)
  
  socketIO.emit('connectUser', user, (response) => {
    console.log("user from User connected ", response)
  })

  socketIO.on('new offer', (resp) => {
  
    console.log("new offer done", resp)

    if(resp?.ok) {

      setTimeout(() => {
        audioRef.current.play()
      }, 0)
      
    }
  
  })


  useEffect(() => {

    return () => {  
      socketIO.disconnect() 
    }

  }, [])

  return (
    <div>
      <audio hidden src={'audio/new-ticket.mp3'} ref={audioRef} />   
      <h2> User Profile'........ </h2>
    </div>
  )
}

export default User
