import Chat from "./Chat"
import { useSocket } from "./socketContext"
import Login from "./Login"
import "./app.css"







function App() {
  const { isLoggedIn} = useSocket()

  return (
    <div>
      {isLoggedIn ?  <Chat/> :  <Login/>}
    </div>
    
  )
}

export default App