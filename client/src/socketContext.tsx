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
  setRoomsList: () => []
};

const SocketContext = createContext<ISocketContext>(defaultValues);
export const useSocket = () => useContext(SocketContext);

const socket = io("http://localhost:3000", { autoConnect: false });

const SocketProvider = ({ children }: PropsWithChildren) => {
  //knappen lämna rum 
  const leaveRoom = () => {
    if (room !== "lobby") {
      socket.emit("leave_room");
      setRoom("lobby");
      setMessageList([]); // Tömmer meddelandelistan när man lämnar rummet
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [room, setRoom] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<messageData[]>([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [roomsList, setRoomsList] = useState<string[]>([]);

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
    socket.on("activeRooms", function (activeRooms) {
      setRoomsList(activeRooms);
    });
  }, []);

  const joinRoom = () => {
    if (room !== "") {
    
        socket.emit("leave_room");
      
      setRoom(currentRoom);
      socket.emit("join_room", room, username);
      setMessageList([]);
    }
  };

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
        setRoomsList
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
