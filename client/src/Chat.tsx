
import { useSocket } from './socketContext'
import liveChatIcon from './assets/live-chat-icon-7417.png';


function Chat() {
  const {leaveRoom,
    room, 
    currentMessage,
    setRoom, 
    joinRoom, 
    messageList, 
    username, 
    sendMessage, 
    setCurrentRoom,
    isTyping,
    typingUsers,
    handleInput,
    usersInRoom,
    roomsList
  } = useSocket()
    
    return (
      <div>
        <div className="container">
          <div className='sidebar'>
         <div>
        <img src={liveChatIcon} width="100px"/>
        <h1 className="logo">Chat App</h1>
       <input className="room-input" onChange={(e) => setCurrentRoom(e.target.value)} type ="text"/><br/>
        <button className="chatBtn" onClick={joinRoom}>Skapa rum</button>              
        </div>
   
        <button className="chatBtn" onClick={leaveRoom}>Tillbaka till lobbyn</button><br />
        <p className='active-rooms-list'>Alla aktiva rum: </p>
          <ul>
            {roomsList.map((activeRoom) => (
              <li className="roomsList" key={activeRoom} value={activeRoom} onClick={() => setRoom(activeRoom)}>
                {activeRoom}
                </li>

            ))}
          </ul>
                   <ul>
                    {usersInRoom.map((user) => (
                      <div>
                        <li key={user}>{user}</li>
                        </div>
                    ))}
                    
                </ul>
        </div>
      <div className="chat">
      <div className="chat-container">
      <h2>Du är inloggad som: {username}</h2><br />
      <h2>Du är i rum: {room}</h2><br />
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
        </div> 
        <div className="chat-body">

        <div className="message-container">
             <div className="feedback">
          {isTyping && (
              <p>
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing now...
              </p>
            )}
          </div>
          {messageList.map((messageContent, index) => {
            
            return (
              <div
                key={index}
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
          onChange={handleInput}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
          
        />
        
          <button onClick={sendMessage}>&#9658;</button>
        </div>
          

       
        
      </div>
      </div>
      </div>
      </div>
      </div>
    );
   
  }



export default Chat