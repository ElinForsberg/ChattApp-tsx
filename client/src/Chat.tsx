
import { useSocket } from './SocketContext'



function Chat() {
    const {room, setRoom} = useSocket()
    const {joinRoom} = useSocket()
  return (
    <div>
       
        <input value={room} onChange={(e) => setRoom(e.target.value)} type ="text"/>
        <button onClick={joinRoom}>Skapa rum</button>
        
        
    </div>
  )
}

export default Chat