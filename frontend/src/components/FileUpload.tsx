"use client"
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMessage(null);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    setProgress(30); // Initial progress

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );
      setMessage(response.data.message);
      setFile(null);
      setProgress(100);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to upload file.');
      setProgress(0);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 2000); // Reset progress after 2s
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in-up">
      <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
        Upload Document
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.txt,.docx,.doc"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-primary transition-all duration-300"
            disabled={isLoading}
          />
        </div>
        {isLoading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full py-3 px-6 bg-primary text-white rounded-full hover:bg-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center text-sm animate-fade-in ${
            message.includes('error') || message.includes('Failed')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default FileUpload;