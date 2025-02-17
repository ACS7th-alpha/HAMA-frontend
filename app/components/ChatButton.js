'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputValue, sender: 'user' },
    ]);

    setInputValue('');

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: '챗봇의 응답입니다!', sender: 'bot' },
      ]);
    }, 1000);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={toggleChat}
        className="bg-orange-500 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
      >
        💬
      </button>
      {isOpen && (
        <div className="bg-white shadow-lg rounded-lg p-4 mt-2 w-80">
          <div className="h-64 overflow-y-auto mb-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start my-1`}>
                {msg.sender === 'user' ? (
                  <div className="flex-grow text-right">
                    <div className="bg-orange-100 text-right p-2 rounded-lg inline-block">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src="/hama_logo.jpg"
                      alt="Chatbot Profile"
                      width={40}
                      height={40}
                      className="rounded-full mr-2"
                    />
                    <div className="bg-gray-100 p-2 rounded-lg inline-block">
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="border rounded-l-lg p-2 flex-grow border-orange-300"
              placeholder="메시지를 입력하세요..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-orange-500 text-white rounded-r-lg p-2 hover:bg-orange-600 transition-colors duration-200"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
