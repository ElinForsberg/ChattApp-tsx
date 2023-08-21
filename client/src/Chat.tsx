
import { useState } from 'react';
import { useSocket } from './SocketContext'



function Chat() {
    const {room, setRoom, currentMessage, joinRoom, messageList, username, setCurrentMessage, sendMessage, currentRoom, setCurrentRoom} = useSocket()
   


    return (
      <div className="chat-window">
        <div className="chat-header">
          <p>Live Chat</p>
        </div>
        <div className="chat-body">
          <div className="message-container">
            {messageList.map((messageContent,index) => {
              return (
                <div key={index}
                  className="message"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">{messageContent.author}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chat-footer">
          <input
            type="text"
            value={currentMessage}
            placeholder="Hey..."
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <button onClick={sendMessage}>&#9658;</button>
        </div>
        <div>
          <p>Du är i rum: {room}</p>
          <p>Alla aktiva rum:</p>
          {/* <ul>
            {activeRooms.map((activeRoom) => (
              <li key={activeRoom}>{activeRoom}</li>
            ))}
          </ul> */}
        </div>
        <div>
       
    <input value={currentRoom} onChange={(e) => setCurrentRoom(e.target.value)} type ="text"/>
     <button onClick={joinRoom}>Skapa rum</button>
               
               
     </div>

      </div>
    );
  }

//   return (

//     <div>
       
//         <input value={room} onChange={(e) => setRoom(e.target.value)} type ="text"/>
//         <button onClick={joinRoom}>Skapa rum</button>
        
        
//     </div>
//   )
// }

export default Chat