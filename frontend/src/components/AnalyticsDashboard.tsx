"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  num_uploads: number;
  most_asked_questions: { question: string; count: number }[];
  usage_over_time: { date: string; count: number }[];
  most_referenced_document: { filename: string; count: number }[];
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics`);
        setData(response.data);
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Failed to fetch analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
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

  if (!data || (data.num_uploads === 0 && data.most_asked_questions.length === 0)) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center text-gray-600 animate-fade-in">
        No analytics data available. Upload documents or ask questions to generate insights!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Number of Uploads */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
        <h2 className="text-xl font-semibold text-primary mb-4">Total Documents Uploaded</h2>
        <p className="text-4xl font-bold text-secondary">{data.num_uploads}</p>
      </div>

      {/* Most Asked Questions */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
        <h2 className="text-xl font-semibold text-primary mb-4">Most Asked Questions</h2>
        {data.most_asked_questions.length > 0 ? (
          <ul className="space-y-2">
            {data.most_asked_questions.map((item, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{item.question}</span> ({item.count} times)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No questions asked yet.</p>
        )}
      </div>

      {/* Model Usage Over Time */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up md:col-span-2">
        <h2 className="text-xl font-semibold text-primary mb-4">Model Usage Over Time</h2>
        {data.usage_over_time.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.usage_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600">No usage data available.</p>
        )}
      </div>

      {/* Most Referenced Document */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
        <h2 className="text-xl font-semibold text-primary mb-4">Most Referenced Document</h2>
        {data.most_referenced_document.length > 0 ? (
          <p className="text-gray-700">
            <span className="font-medium">{data.most_referenced_document[0].filename}</span> ({data.most_referenced_document[0].count} references)
          </p>
        ) : (
          <p className="text-gray-600">No documents referenced yet.</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;