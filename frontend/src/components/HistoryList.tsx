"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface HistoryItem {
  question: string;
  answer: string;
  timestamp: string;
}

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history`);
        setHistory(response.data);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <svg
          className="animate-spin h-8 w-8 text-primary"
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center text-red-600 animate-fade-in">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center text-gray-600 animate-fade-in">
        No query history found. Ask a question on the Query page to get started!
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Question
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Answer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                  {item.question}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                  {item.answer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;