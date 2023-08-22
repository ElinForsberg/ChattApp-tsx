import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
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
    typingUsers: string[], // Added typingUsers to the context value
    isTyping: boolean, // Added isTyping to the context value
    handleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    typingUsers: [], // Initialize as an empty array
    isTyping: false,  // Added isTyping to the context value
    handleInput: () => {},

    
}

const SocketContext = createContext<ISocketContext>(defaultValues);

export const useSocket = () => useContext(SocketContext);

const socket = io("http://localhost:3000", { autoConnect: false });

const SocketProvider = ({children}: PropsWithChildren) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState<string>("");
    const [room, setRoom] = useState("");
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<messageData[]>([]);
    const [currentRoom, setCurrentRoom] = useState("");
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    
    // const [showChat, setShowChat] = useState(false);

    
      const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputMessage = event.target.value;
        setCurrentMessage(inputMessage);
    
        if (inputMessage.trim() !== "") {
          socket.emit("typing", username);
        } else {
          socket.emit("not_typing", username);
        }
      };
    
    
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

    const joinRoom = () => {
        if ( room !== "") {
            setRoom(currentRoom);
            socket.emit("join_room", room, username);
            
            // setShowChat(true);
            console.log(room);
          }
    }

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
      }, []);
      useEffect(() => {
        const handleTyping = (username: string) => {
          if (!typingUsers.includes(username)) {
            setTypingUsers((prevTypingUsers) => [...prevTypingUsers, username]);
          }
          setIsTyping(true);
        };
    
        const handleNotTyping = (username: string) => {
          setTypingUsers((prevTypingUsers) =>
            prevTypingUsers.filter((user) => user !== username)
          );
          if (typingUsers.length === 0) {
            setIsTyping(false);
          }
        };
    
        socket.on("typing", handleTyping);
        socket.on("not_typing", handleNotTyping);
       
    
        return () => {
          socket.off("typing", handleTyping);
          socket.off("not_typing", handleNotTyping);
        };
      }, [typingUsers]);

    return (
        <SocketContext.Provider value={{username, 
        isLoggedIn, 
        login,
        setUsername, 
        room, 
        setRoom, 
        joinRoom, 
        currentMessage, 
        setCurrentMessage, 
        messageList, 
        setMessageList, 
        sendMessage, 
        currentRoom, 
        setCurrentRoom,
        typingUsers, // Added typingUsers to the context value
        isTyping, // Added isTyping to the context value
        handleInput

        }}>
            {children}
        </SocketContext.Provider>
    
    )
   
    }     


    export default SocketProvider