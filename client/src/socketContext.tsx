import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import {io} from "socket.io-client"

interface ISocketContext {
    isLoggedIn: boolean
    username: string
    setUsername: React.Dispatch<React.SetStateAction<string>>
    room: string
    setRoom: React.Dispatch<React.SetStateAction<string>>
    login: () => void
}

const defaultValues = {
    username:"",
    setUsername: () => {},
    room:"",
    setRoom: () => {},
    isLoggedIn: false,
    login: () => {}

    
}

const SocketContext = createContext<ISocketContext>(defaultValues)
export const useSocket = () => useContext(SocketContext)

const socket =io("http://localhost:3000", {autoConnect: false})

const SocketProvider = ({children}: PropsWithChildren) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState<string>("");
    const [room, setRoom] = useState("");

    useEffect(() => {
        if(room){
            socket.emit("join_room", room)
        }
       
    }, [room])

    const login = () => {
        socket.connect()
        setIsLoggedIn(true)
        setRoom("lobby")
    }

    return (
        <SocketContext.Provider value={{username, isLoggedIn, login, setUsername, room, setRoom}}>
            {children}
        </SocketContext.Provider>
    
    )
   
    }     


    export default SocketProvider