
import { useSocket } from './socketContext'

function Login() {
    const {login, username, setUsername} = useSocket()
  return (
    <div>login
        <input value={username} onChange={(e) => setUsername(e.target.value)} type ="text"/>
        <button onClick={login}>Börja chatta</button>
    </div>
  )
}

export default Login