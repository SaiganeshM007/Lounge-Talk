// App.js
import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./App.css"; // Import your CSS file for styling

function App() {
  const socket = useMemo(() => {
    return io("http://localhost:9000");
  }, []);

  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomName) {
      socket.emit("join-room", roomName);
    }
  };

  const leaveRoom = (e) => {
    e.preventDefault();
    if (roomName) {
      socket.emit("leave-room", roomName);
      setRoomName("");
      setMessages([]);
      setNotifications([]);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message && roomName) {
      socket.emit("message", { message, displayName, roomName });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log(data.displayName, data.message);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("room-notification", (data) => {
      console.log(data.message);
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        data.message,
      ]);
    });

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.off("room-notification");
    };
  }, [socket]);

  return (
    <div>
      <header className="header">
        <h1>LoungeTalk</h1>
      </header>
      <div className="container">
        <form onSubmit={joinRoom}>
          <input
            type="text"
            name="room"
            value={roomName}
            placeholder="Room Name"
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button type="submit">Join Room</button>
          <button onClick={leaveRoom}>Leave Room</button>
        </form>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            name="displayName"
            value={displayName}
            placeholder="Your Name"
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            type="text"
            name="message"
            value={message}
            placeholder="Enter Message"
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">Send Message</button>
        </form>
        <div className="messages">
          <h2>Messages</h2>
          {messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.displayName}</strong>: {msg.message}
            </p>
          ))}
        </div>
        <div className="notifications">
          <h2>Logs</h2>
          {notifications.map((notification, index) => (
            <p key={index}>{notification}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
