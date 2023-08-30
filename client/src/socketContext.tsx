import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

import { io } from "socket.io-client";

interface ISocketContext {
  isLoggedIn: boolean;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  room: string;
  setRoom: React.Dispatch<React.SetStateAction<string>>;
  login: () => void;
  joinRoom: () => void;
  leaveRoom: () => void; // Lämna rum 
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  messageList: messageData[];
  setMessageList: React.Dispatch<React.SetStateAction<messageData[]>>;
  sendMessage: () => void;
  currentRoom: string;
  setCurrentRoom: React.Dispatch<React.SetStateAction<string>>;
  roomsList: string[];
  setRoomsList: React.Dispatch<React.SetStateAction<string[]>>;
   typingUsers: string[], // Added typingUsers to the context value
   isTyping: boolean, // Added isTyping to the context value
   handleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
   usersInRoom: string[]  
   fetchGif: () => void
   userList: userData[];
   setUserList: React.Dispatch<React.SetStateAction<userData[]>>;
   
}

interface messageData {
  room: string;
  author: string;
  message: string;
  time: string;
  
}

interface userData {
  roomName: string;
  // room: string;
  usernames: string[];
}

const defaultValues = {

  username: "",
  setUsername: () => {},
  room: "",
  setRoom: () => {},
  isLoggedIn: false,
  login: () => {},
  joinRoom: () => {},
  leaveRoom: () => {}, // lämna rum 
  currentMessage: "",
  setCurrentMessage: () => {},
  messageList: [],
  setMessageList: () => [],
  sendMessage: () => {},
  currentRoom: "",
  setCurrentRoom: () => {},
  roomsList: [],
  setRoomsList: () => [],
  typingUsers: [], // Initialize as an empty array
  isTyping: false,  // Added isTyping to the context value
  handleInput: () => {},
  usersInRoom:[],
  fetchGif: () => {},
  userList: [],
  setUserList: () => []
  
};


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
    const [usersInRoom] = useState<string[]>([]);
    const [roomsList, setRoomsList] = useState<string[]>([]);
    const [userList, setUserList] = useState<userData[]>([]);
  
    
    
  const leaveRoom = () => {
    if (room !== "lobby") {
      const roomSize = usersInRoom.length; // Antal användare i aktuellt rum
      if (roomSize === 1) {
        // Om du är den enda användaren i rummet, lämna det och gå till lobbyn
        socket.emit("leave_room");
        setRoom("lobby");
        setMessageList([]); // Tömmer meddelandelistan när man lämnar rummet
      } else {
        // Om det finns andra användare i rummet, skicka inte "leave_room", bara gå till lobbyn
        setRoom("lobby");
        setMessageList([]); // Tömmer meddelandelistan när man lämnar rummet
      }
    }
  };
  

    
 useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }
  }, [room]);

  const login = () => {
    socket.connect();
    socket.auth = { username };
    setIsLoggedIn(true);
    setRoom("lobby");
    console.log(username);
  };
    
  useEffect(() => {
    socket.on("active_rooms", function (activeRooms) {
     
      
      setRoomsList(activeRooms);
      
      
    });
  }, []);

  useEffect(() => {
    socket.on("users_in_room", function (data) {
      setUserList(data)

      
    });
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
      setIsTyping(false);  
      console.log(messageList)    
    });
  }, [isTyping, messageList]);

  useEffect(() => {
    socket.on("typing", (room) => {
      if (!typingUsers.includes(room)) {
        setTypingUsers((prevTypingUsers) => [...prevTypingUsers, room]);
         
      }
      setIsTyping(true);

    });

    socket.on("not_typing", (room) => {
      setTypingUsers((prevTypingUsers) =>
        prevTypingUsers.filter((user) => user !== room)
      );    
      console.log(setIsTyping)
      if (typingUsers.length === 0) {
        setIsTyping(false);
         
      }

    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("not_typing");
       

    };
  }, [isTyping, room, typingUsers]);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputMessage = event.target.value;
    setCurrentMessage(inputMessage);
  
    if (inputMessage.trim() !== "") {
      socket.emit("typing", username, room); // Send room information
    } else {
      socket.emit("not_typing",username, room); // Send room information
    }
 
  };
  
    

    const joinRoom = () => {
        if ( room !== "") {
            setRoom(currentRoom);
            socket.emit("join_room", room, username);
            setMessageList([]);
            
            
          }
    }

  

  
  
  const sendMessage = async () => {
    if (currentMessage !== "") {
      let messageData: messageData;
      if (currentMessage.match("/gif")) {
       
         const url= await fetchGif();
        
        
        
        messageData = {
          room: room,
          author: username, // Use the current user's username as the author
          message: url,
          time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        };
      } else {
        messageData = {
          room: room,
          author: username,
          message: currentMessage,
          time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        };
      }
      
      await socket.emit("send_message", messageData);
      
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setIsTyping(false)
      console.log(messageList) 
    }
  };
  
    const fetchGif = async ()=>  {
      try {
          
          const giphyUrl = "https://api.giphy.com/v1/gifs/random?api_key=lwMa3B9QFK1Z9GZRQu1iZkhRWkiQoZXp&tag=&rating=g";
          const response = await fetch(giphyUrl);
          const data = await response.json();
          const gifUrl = data.data.images.downsized.url;
         
              return gifUrl
                   
      } catch (error) {
          console.log(error);
          
      }
  };
  
  

  return (
    <SocketContext.Provider
      value={{
        username,
        isLoggedIn,
        login,
        setUsername,
        room,
        setRoom,
        joinRoom,
        leaveRoom,
        currentMessage,
        setCurrentMessage,
        messageList,
        setMessageList,
        sendMessage,
        currentRoom,
        setCurrentRoom,
        roomsList,
        setRoomsList,
        typingUsers,
        isTyping,
        handleInput,
        usersInRoom,
        fetchGif,
        userList,
        setUserList
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
