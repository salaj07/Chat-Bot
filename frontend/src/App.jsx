import { io } from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [socket, setsocket] = useState(null);
  const [messages, setMessages] = useState([
    // {
    //   id: 1,
    //   sender: "bot",
    //   text: "Hello! Type a message and press Send.",
    //   time: new Date().toLocaleTimeString(),
    // },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const msg = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    console.log(text);

    setMessages((prev) => [...prev, msg]);
    // emit the trimmed text to the backend
    if (socket) {
      socket.emit("ai-message", text);
    } else {
      console.warn("socket not ready yet");
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    let socketInstance = io("http://localhost:3001");
    setsocket(socketInstance);

    socketInstance.on("ai-message-response", (response) => {
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: response,
        time: new Date().toLocaleTimeString(),
      };
    //   // append incoming bot/model response to conversation
      setMessages((prev) => [...prev, botMessage]);
    });

    socketInstance.on("connect", () => {
      console.log("connected to socket", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("socket disconnected", reason);
    });

    // return () => {
    //   // socketInstance.off("ai-message-response");
    //   // socketInstance.disconnect();
    // };
  }, []);

  return (
    <div className="chat-app">
      <header className="chat-header">Chat</header>

      <div className="chat-window">
        <div className="messages" role="log" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`message-row ${m.sender}`}>
              {m.sender === "bot" && (
                <div className="avatar" aria-hidden>
                  🤖
                </div>
              )}

              <div className={`message ${m.sender}`}>
                <div className="message-text">{m.text}</div>
                <div className="message-time">{m.time}</div>
              </div>

              {m.sender === "user" && (
                <div className="avatar" aria-hidden>
                  🙂
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            className="input"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button type="submit" className="send" disabled={!input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
