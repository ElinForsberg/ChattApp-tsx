import Chat from "./Chat"
import { useSocket } from "./SocketContext"
import Login from "./login"







function App() {
  const { isLoggedIn} = useSocket()

  return (
    <div>
      {isLoggedIn ?  <Chat/> :  <Login/>}
    </div>
    
  )
}

export default App