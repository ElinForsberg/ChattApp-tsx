
import { useSocket } from './SocketContext'



function Chat() {
    const {setRoom} = useSocket()
  return (
    <div>
        <button onClick={() => setRoom("123")}>Joina rum 123</button>
        <button onClick={() => setRoom("456")}>Joina rum 456</button>
        
    </div>
  )
}

export default Chat