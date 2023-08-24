
import { useSocket } from './socketContext'

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


        <div className='sidebar'>
        <p>Du är inloggad som: {username}</p><br />
        <p>Du är i rum: {room}</p><br />
        <button onClick={leaveRoom}>Tillbaka till lobbyn</button><br />
        <p>Alla aktiva rum: </p>
          <ul>
            {roomsList.map((activeRoom) => (
              <li key={activeRoom} value={activeRoom} onClick={() => setRoom(activeRoom)}>
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
        <div>
       

    <input onChange={(e) => setCurrentRoom(e.target.value)} type ="text"/>
     <button onClick={joinRoom}>Skapa rum</button>
               
               
     </div>

      </div>
    );
   
  }



export default Chat