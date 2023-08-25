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
    
};


const SocketContext = createContext<ISocketContext>(defaultValues);

// eslint-disable-next-line react-refresh/only-export-components
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
    
    // const [showChat, setShowChat] = useState(false);
  
    //knappen lämna rum 
  //   const leaveRoom = () => {
  //   if (room !== "lobby") {
  //     socket.emit("leave_room");
  //     setRoom("lobby");
  //     setMessageList([]); // Tömmer meddelandelistan när man lämnar rummet
  //   }
  // };

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
      socket.on("typing", (username) => {
        if (!typingUsers.includes(username)) {
          setTypingUsers((prevTypingUsers) => [...prevTypingUsers, username]);
           
        }
        setIsTyping(true);
         
      });
  
      socket.on("not_typing", (username) => {
        setTypingUsers((prevTypingUsers) =>
          prevTypingUsers.filter((user) => user !== username)
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
    }, [isTyping, typingUsers]);
  
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputMessage = event.target.value;
      setCurrentMessage(inputMessage);
  
      if (inputMessage.trim() !== "") {
        socket.emit("typing", username);
      } else {
        socket.emit("not_typing", username);
      }
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
        usersInRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
