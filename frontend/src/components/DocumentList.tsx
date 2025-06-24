"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DocumentItem {
  filename: string;
  size: number;
  uploaded_at: number;
}

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/documents`);
      setDocuments(response.data);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to fetch documents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/delete-document/${filename}`);
      setSuccess(response.data.message);
      setDocuments(documents.filter((doc) => doc.filename !== filename));
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete document.');
    } finally {
      setConfirmDelete(null);
    }
  };

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

  if (error && !success) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center text-red-600 animate-fade-in">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center text-gray-600 animate-fade-in">
        No documents found. Upload a document on the Upload page to get started!
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg animate-fade-in">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.filename}
            className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-all duration-200"
          >
            <h3 className="text-lg font-semibold text-primary truncate">{doc.filename}</h3>
            <p className="text-sm text-gray-600">
              Size: {(doc.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-sm text-gray-600">
              Uploaded: {new Date(doc.uploaded_at * 1000).toLocaleString()}
            </p>
            <button
              onClick={() => setConfirmDelete(doc.filename)}
              className="mt-2 w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{confirmDelete}</strong>? This will also remove its embeddings.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;