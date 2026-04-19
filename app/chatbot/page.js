"use client";
import { useState, useRef, useEffect } from "react";
import { BsChatSquareText } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const recognition = useRef(null);
  const messagesEndRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("chatHistoryList") || "[]");
    setHistory(savedHistory);
    if (activeChat === null && savedHistory.length > 0) {
      setMessages(savedHistory[0].messages);
      setActiveChat(savedHistory[0].id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save history
  const saveHistory = (msgs, title) => {
    const updated = history.filter((h) => h.id !== activeChat);
    const newChat = { id: activeChat || Date.now(), title, messages: msgs, time: new Date().toLocaleString() };
    const all = [newChat, ...updated];
    localStorage.setItem("chatHistoryList", JSON.stringify(all));
    setHistory(all);
  };

  // Send message
  const sendMessage = async (msg = null) => {
    const text = msg || input.trim();
    if (!text) return;

    const newMsgs = [...messages, { sender: "user", text }];
    setMessages(newMsgs);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      const botText = data.answer || "⚠️ No response from server.";
      let current = "";
      setMessages((p) => [...p, { sender: "bot", text: "" }]);

      for (let i = 0; i < botText.length; i++) {
        current += botText[i];
        setMessages((p) => {
          const updated = [...p];
          updated[updated.length - 1].text = current;
          return updated;
        });
        await new Promise((r) => setTimeout(r, 10));
      }
      setIsTyping(false);
      saveHistory([...newMsgs, { sender: "bot", text: botText }], newMsgs[0].text);

    } catch (e) {
      console.error(e);
      setIsTyping(false);
      setMessages((p) => [...p, { sender: "bot", text: "⚠️ Server error. Please try again." }]);
    }
  };

  // 🎙 Voice recognition
  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
      return;
    }

    recognition.current = new window.webkitSpeechRecognition();
    recognition.current.lang = "en-US";
    recognition.current.continuous = false;
    recognition.current.interimResults = false;

    recognition.current.onstart = () => setIsListening(true);
    recognition.current.onend = () => setIsListening(false);
    recognition.current.onresult = (e) => {
      const final = e.results[0][0].transcript.trim();
      setInput(final);
      sendMessage(final);
    };

    recognition.current.start();
  };

  // 🆕 New Chat
  const newChat = () => {
    setMessages([]);
    setActiveChat(Date.now());
  };

  // 📜 Open old chat
  const openChat = (chat) => {
    setMessages(chat.messages);
    setActiveChat(chat.id);
  };

  // 🗑 Delete chat
  const deleteChat = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("chatHistoryList", JSON.stringify(updated));
    if (activeChat === id) newChat();
  };

  // 🎧 Listen bot response
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 bg-zinc-950 flex flex-col justify-between shadow-lg">
        <div className="flex flex-col space-y-4 p-5 overflow-y-auto">
          <button
            onClick={newChat}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg shadow-md font-semibold"
          >
            ➕ New Chat
          </button>

          <div className="mt-4 text-gray-400 font-semibold text-sm">Chat History</div>
          {history.map((chat) => (
            <div
              key={chat.id}
              onClick={() => openChat(chat)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (confirm("Delete this chat?")) deleteChat(chat.id);
              }}
              className={`p-2 rounded-lg cursor-pointer truncate ${
                chat.id === activeChat ? "bg-blue-800" : "hover:bg-gray-700"
              }`}
              title={chat.title}
            >
              {chat.title}
              <div className="text-xs text-gray-400">{chat.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-zinc-900 rounded-[35px] overflow-hidden m-3 shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="bg-black p-5 text-xl font-semibold flex justify-between">
          Chatty Assistant 🤖
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 flex flex-col bg-zinc-900">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`px-5 py-3 rounded-2xl text-lg max-w-[80%] shadow-md leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-zinc-800 self-end ml-auto"
                  : "bg-black self-start"
              }`}
            >
              {msg.text}
              {msg.sender === "bot" && (
                <div className="flex gap-3 mt-2 text-sm text-gray-400">
                  <button onClick={() => speak(msg.text)}>🎧 Listen</button>
                  <button>👍</button>
                  <button>👎</button>
                  <button onClick={() =>
                    setMessages((p) => p.filter((_, i) => i !== idx))
                  }>🗑 Delete</button>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex space-x-1 bg-black px-4 py-3 rounded-2xl self-start">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-zinc-950 p-4 rounded-b-[35px] flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Speak or type your message..."
            className="flex-1 px-6 py-3 rounded-full bg-black text-lg outline-none shadow-md"
          />
          <button
            onClick={toggleListening}
            className={`ml-3 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              isListening ? "bg-red-500 animate-pulse" : "bg-green-500 hover:bg-green-600"
            }`}
            title="Voice Input"
          >
            <FaMicrophone />
          </button>
          <button
            onClick={() => sendMessage()}
            className="ml-3 w-12 h-12 rounded-full bg-white text-black hover:bg-gray-200"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
