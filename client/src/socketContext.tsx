import { PropsWithChildren, SetStateAction, createContext, useContext, useEffect, useState } from "react"
import {io} from "socket.io-client"

interface ISocketContext {
    isLoggedIn: boolean
    username: string
    setUsername: React.Dispatch<React.SetStateAction<string>>
    room: string
    setRoom: React.Dispatch<React.SetStateAction<string>>
    login: () => void
    joinRoom: () => void
    currentMessage: string
    setCurrentMessage:  React.Dispatch<React.SetStateAction<string>>
    messageList: messageData[]
    setMessageList: React.Dispatch<React.SetStateAction<messageData[]>>
    sendMessage: () => void
    currentRoom: string
    setCurrentRoom: React.Dispatch<React.SetStateAction<string>>
    roomsList: string[];
    setRoomsList: React.Dispatch<React.SetStateAction<string[]>>
    
}

interface messageData {
        room:  string;
        author:  string;
        message: string;
        time: string;
    }
  
  
  

const defaultValues = {
    username:"",
    setUsername: () => {},
    room:"",
    setRoom: () => {},
    isLoggedIn: false,
    login: () => {},
    joinRoom: () => {},
    currentMessage: "",
    setCurrentMessage: () => {},
    messageList: [],
    setMessageList: () => {[]},
    sendMessage: () => {},
    currentRoom: "",
    setCurrentRoom: () => {},
    roomsList: [],
    setRoomsList: () => []
    

    
}

const SocketContext = createContext<ISocketContext>(defaultValues)
export const useSocket = () => useContext(SocketContext)

const socket =io("http://localhost:3000", {autoConnect: false})

const SocketProvider = ({children}: PropsWithChildren) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState<string>("");
    const [room, setRoom] = useState("");
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<messageData[]>([]);
    const [currentRoom, setCurrentRoom] = useState("");
    const [roomsList, setRoomsList] = useState<string[]>([]);
    
    // const [showChat, setShowChat] = useState(false);

    
    
    useEffect(() => {
        if(room){
            socket.emit("join_room", room)
        }
       
    }, [room])

    const login = () => {
        socket.connect()
        setIsLoggedIn(true)
        setRoom("lobby")
        console.log(username);
        
    }
    useEffect(() => {
      socket.on('activeRooms', function (activeRooms) {
        // Handle the received activeRooms array
        // console.log("Received active rooms:", activeRooms);
        setRoomsList(activeRooms)
        
      })
    }, [])

   
    
    
    // const joinRoom = () => {
    //     if ( room !== "") {
    //         setRoom(currentRoom);
    //         socket.emit("join_room", room, username);
            
    //         // setShowChat(true);
    //         console.log(room);
    //       }
    // }
    const joinRoom = () => {
      if ( room !== "") {
          setRoom(currentRoom);
          socket.emit("leave_room");
          socket.emit("join_room", room, username);
          
          setMessageList([]);
          
          // setShowChat(true);
          console.log(room);
        }
  }
  
    
    // You can update the UI or perform any other actions with the activeRooms array
  
  

    const sendMessage = async () => {
        if (currentMessage !== "") {
          const messageData = {
            room: room,
            author: username,
            message: currentMessage,
            time:
              new Date(Date.now()).getHours() +
              ":" +
              new Date(Date.now()).getMinutes(),
          };
    
          await socket.emit("send_message", messageData);
          setMessageList((list) => [...list, messageData]);
          setCurrentMessage("");
        }
      };

      useEffect(() => {
        socket.on("receive_message", (data) => {
          setMessageList((list) => [...list, data]);
        });
      }, [socket]);
    

    return (
        <SocketContext.Provider value={{username, isLoggedIn, login, setUsername, room, setRoom, joinRoom, currentMessage, setCurrentMessage, messageList, setMessageList, sendMessage, currentRoom, setCurrentRoom, roomsList, setRoomsList}}>
            {children}
        </SocketContext.Provider>
    
    )
   
    }     


    export default SocketProvider