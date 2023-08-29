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
   gif: string;
   setGif: React.Dispatch<React.SetStateAction<string>>
   fetchGif: () => void
   sendGif: string;
   setSendGif: React.Dispatch<React.SetStateAction<string>>
   

}

interface messageData {
  room: string;
  author: string;
  message: string;
  time: string;
  
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
  gif: "",
  setGif: () => {},
  fetchGif: () => {},
  sendGif: "",
  setSendGif: () => {}
    
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
    const [usersInRoom, setUsersInRoom] = useState<string[]>([]);
    const [roomsList, setRoomsList] = useState<string[]>([]);
    const [gif, setGif] = useState<string>("");
    const [sendGif, setSendGif ]= useState<string>("");
    
    
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
    setIsLoggedIn(true);
    setRoom("lobby");
    console.log(username);
  };
    
      

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
      setIsTyping(false);      
    });
  }, [isTyping]);

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
          const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if(timeDiff >= timerLength && typingUsers){
        socket.emit("not_typing",username);
        setIsTyping(false)
      }
    },timerLength);
  };
  
    

    const joinRoom = () => {
        if ( room !== "") {
            setRoom(currentRoom);
            socket.emit("join_room", room, username);
            setMessageList([]);
            const updatedUsersInRoom = [...usersInRoom, username]; // Add current user's username
            setUsersInRoom(updatedUsersInRoom); // Update the local state
    
            socket.emit("users_in_room", updatedUsersInRoom); // Emit the updated list of users
            // setShowChat(true);
            
            console.log(room);
            console.log(usersInRoom)
            
          }
    }

  useEffect(() => {
    socket.on("activeRooms", function (activeRooms) {
      setRoomsList(activeRooms);
    });
  }, []);

  
  
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
    }
  };
  

  useEffect(() => {
   
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    
  
  }, []);
  
  
        
     useEffect(() => {
     socket.on("users_in_room", (users) => {
            setUsersInRoom(users);
        });

        return () => {
            socket.off("users_in_room");
        };
    }, []);
   
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
        gif,
        setGif,
        fetchGif,
        sendGif,
        setSendGif
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
