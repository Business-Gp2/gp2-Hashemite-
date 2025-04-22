import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';

// Backend API URL configuration
const API_URL = 'http://localhost:5000'; // Update this to match your backend URL

const UploadDocument = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'homework',
    description: '',
    course: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState(null);

  useEffect(() => {
    // Check if we're editing an existing document
    if (location.state?.document) {
      const { document } = location.state;
      setIsEditing(true);
      setDocumentId(document._id);
      setFormData({
        title: document.title,
        type: document.type,
        description: document.description,
        course: document.course,
        file: null // We'll keep the existing file unless changed
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const convertToPDF = async (file) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      // Add file information
      page.drawText(`File Information:\nName: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(2)} KB`, {
        x: 50,
        y: height - 50,
        size: 12,
      });

      // Handle different file types
      if (file.type.startsWith('image/')) {
        // For images, we'll just add the file info since we can't easily embed images
        page.drawText('\n\nThis is an image file. The original image is preserved in the upload.', {
          x: 50,
          y: height - 100,
          size: 12,
        });
      } else if (file.type === 'application/pdf') {
        // If it's already a PDF, return it as is
        return file;
      } else if (file.type.startsWith('text/') || file.type.includes('word') || file.type.includes('excel')) {
        // For text-based files, try to read the content
        try {
          const text = await file.text();
          page.drawText(`\n\nFile Content:\n${text.substring(0, 1000)}...`, {
            x: 50,
            y: height - 150,
            size: 12,
          });
        } catch (error) {
          page.drawText('\n\nUnable to extract text content from this file type.', {
            x: 50,
            y: height - 100,
            size: 12,
          });
        }
      } else {
        // For other file types
        page.drawText('\n\nThis file type cannot be directly converted to PDF. The original file is preserved in the upload.', {
          x: 50,
          y: height - 100,
          size: 12,
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return new File([pdfBytes], `${file.name}.pdf`, { type: 'application/pdf' });
    } catch (error) {
      console.error('Error converting to PDF:', error);
      throw new Error('Failed to convert file to PDF');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      try {
        // Convert the file to PDF
        const pdfFile = await convertToPDF(file);
        setFormData(prev => ({
          ...prev,
          file: pdfFile
        }));
        toast.success('File processed successfully');
      } catch (error) {
        toast.error('Failed to process file');
      }
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.title || !formData.type || !formData.description || !formData.course) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!formData.file && !isEditing) {
        toast.error('Please select a file to upload');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('course', formData.course);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      let response;
      if (isEditing) {
        // Update existing document
        response = await axios.put(`${API_URL}/api/documents/draft/${documentId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Create new document
        const endpoint = isDraft ? `${API_URL}/api/documents/draft` : `${API_URL}/api/documents/upload`;
        response = await axios.post(endpoint, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }

      toast.success(response.data.message);
      // Reset form
      setFormData({
        title: '',
        type: 'homework',
        description: '',
        course: '',
        file: null
      });
      document.getElementById('fileInput').value = '';
      
      // Navigate back to drafts page if editing
      if (isEditing) {
        navigate('/draft-document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to the server. Please make sure the backend server is running.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || 'Failed to upload document');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('An error occurred while uploading the document');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Draft Document' : 'Upload Document'}
      </h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="homework">Homework</option>
              <option value="excuse_of_absence">Excuse of Absence</option>
              <option value="grade_review">Grade Review</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Document (Any file type - will be processed to PDF)
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required={!isEditing}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 5MB. File will be processed and converted to PDF format.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            {!isEditing && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update' : 'Upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument; 