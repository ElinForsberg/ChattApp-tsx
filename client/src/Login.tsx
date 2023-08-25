import './Login.css'
import { useSocket } from './socketContext'
import liveChatIcon from './assets/live-chat-icon-7417.png';

function Login() {
  const {login, username, setUsername} = useSocket()
  return (
  
  <div className="login">
    <img src={liveChatIcon} width="100px"/>
    <h1>Chat App</h1>
    <h2>Skapa användarnamn</h2>
    <input className="loginInput" value={username} onChange={(e) => setUsername(e.target.value)} type ="text"/>
        <button className="loginBtn" onClick={login}>Börja chatta</button>
    </div>
  )
}

export default Login