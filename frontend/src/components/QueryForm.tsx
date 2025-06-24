"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface SourceInfo {
  source: string;
  confidence: number;
  content: string;
}


interface ApiResponse {
  question: string;
  answer: string;
  sources: SourceInfo[];
}

const QueryForm: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/query`,
        { question: userMessage.content },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: response.data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setSources(response.data.sources);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch answer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up max-w-2xl w-full flex flex-col h-[500px]">
      <h2 className="text-2xl font-semibold text-primary mb-4 text-center">
        Chat with AI Knowledge Extractor
      </h2>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg space-y-4"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-500">Start the conversation by asking a question!</p>
        )}
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-xs text-gray-400 mt-1 block">{msg.timestamp}</span>
              {msg.sender === 'bot' && index === messages.length - 1 && sources.length > 0 && (
                <div className="mt-2 text-sm text-gray-500 space-y-2">
                  <p className="font-semibold">Sources:</p>
                                {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-primary pl-3 bg-gray-100 rounded p-2 text-sm"
                >
                  <p><strong>Filename:</strong> {src.source}</p>
                  <p>
                    <strong>Confidence:</strong>{' '}
                    {Math.min(Math.max(src.confidence, 0), 100).toFixed(2)}%
                  </p>
                  <p className="italic line-clamp-2 text-gray-600">{src.content.slice(0, 200)}...</p>
                </div>
              ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                ></path>
              </svg>
              <span className="text-gray-800">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="py-3 px-6 bg-primary text-white rounded-lg hover:bg-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default QueryForm;
