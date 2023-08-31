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
  leaveRoom: () => void; 
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  messageList: messageData[];
  setMessageList: React.Dispatch<React.SetStateAction<messageData[]>>;
  sendMessage: () => void;
  currentRoom: string;
  setCurrentRoom: React.Dispatch<React.SetStateAction<string>>;
  roomsList: string[];
  setRoomsList: React.Dispatch<React.SetStateAction<string[]>>;
   handleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
   usersInRoom: string[];  
   fetchGif: () => void;
   userList: userData[];
   typingUsers: string[]
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
  leaveRoom: () => {}, 
  currentMessage: "",
  setCurrentMessage: () => {},
  messageList: [],
  setMessageList: () => [],
  sendMessage: () => {},
  currentRoom: "",
  setCurrentRoom: () => {},
  roomsList: [],
  setRoomsList: () => [],
  handleInput: () => {},
  usersInRoom:[],
  fetchGif: () => {},
  userList: [],
  setUserList: () => [],
  typingUsers:[]
};

const SocketContext = createContext<ISocketContext>(defaultValues);

export const useSocket = () => useContext(SocketContext);

const socket = io("http://localhost:3000", { autoConnect: false });

const SocketProvider = ({children}: PropsWithChildren) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [room, setRoom] = useState("");
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<messageData[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [currentRoom, setCurrentRoom] = useState("");
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
    socket.on("receive_typing_status", (data) => {
      const { username, isTyping } = data;
  
      if (isTyping) {
        setTypingUsers((prevUsers) => [...prevUsers, username]);
      } else {
        setTypingUsers((prevUsers) => prevUsers.filter((user) => user !== username));
      }
    });
  }, []);

  
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


  // Define a timeout variable to clear typing status

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputMessage = event.target.value;
    setCurrentMessage(inputMessage);
  
    if (inputMessage !== "") {
      // Emit typing status when the user starts typing
      socket.emit("typing_status", { room, username, isTyping: true });
      
    } else {
      // If no message, emit typing status with isTyping set to false immediately
      socket.emit("typing_status", { room, username, isTyping: false });
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
      
    }
  };
  
  useEffect(() => {
   socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
     
    });
    
  }, []);
  
 
  

    const fetchGif = async ()=>  {
      try {
          
          const giphyUrl = `https://api.giphy.com/v1/gifs/random?api_key=${import.meta.env.VITE_API_KEY}&tag=&rating=g`;
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
        handleInput,
        usersInRoom,
        fetchGif,
        userList,
        setUserList,
        typingUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
