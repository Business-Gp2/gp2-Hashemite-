import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const DraftDocument = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/documents/drafts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDrafts(response.data.documents);
    } catch (error) {
      toast.error('Failed to fetch draft documents');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (document) => {
    if (!document.file) {
      toast.error('No file available for this document');
      return;
    }
    
    // Cloudinary URL is already a direct URL to the file
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  const handleEdit = (document) => {
    navigate('/upload-document', { state: { document } });
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await axios.delete(`${API_URL}/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        toast.success('Draft deleted successfully');
        fetchDrafts();
      } catch (error) {
        toast.error('Failed to delete draft');
      }
    }
  };

  const handleSubmit = async (documentId) => {
    try {
      await axios.put(`${API_URL}/api/documents/submit/${documentId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Document submitted successfully');
      fetchDrafts();
    } catch (error) {
      toast.error('Failed to submit document');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Draft Documents</h1>
      {drafts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No draft documents found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((doc) => (
            <div key={doc._id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{doc.title}</h2>
                  <p className="text-gray-600 mt-1">{doc.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Type: {doc.type}</p>
                    <p>Course: {doc.course}</p>
                    <p>Created: {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(doc)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(doc)}
                    className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleSubmit(doc._id)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                <p className="text-gray-600">Course: {selectedDocument.course}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex">
              <div className="w-1/3 p-4 border-r">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Document Details</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Title:</span> {selectedDocument.title}</p>
                      <p><span className="font-medium">Type:</span> {selectedDocument.type}</p>
                      <p><span className="font-medium">Course:</span> {selectedDocument.course}</p>
                      <p><span className="font-medium">Description:</span> {selectedDocument.description}</p>
                      <p><span className="font-medium">Status:</span> {selectedDocument.status}</p>
                      <p><span className="font-medium">Created:</span> {new Date(selectedDocument.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">File Path:</span> {selectedDocument.file}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-2/3 p-4">
                {selectedDocument.file ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-2">
                      <a 
                        href={`${API_URL}${selectedDocument.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <iframe
                      src={`${API_URL}${selectedDocument.file}`}
                      className="flex-1 w-full"
                      title="PDF Viewer"
                      onError={(e) => {
                        console.error('Error loading PDF:', e);
                        toast.error('Failed to load PDF. Please try opening in a new tab.');
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No document file available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftDocument; 