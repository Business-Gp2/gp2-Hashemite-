import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import DoctorLayout from "./DoctorLayout";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  User,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const DoctorPendingDocuments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/doctor/pending-documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error("Failed to fetch pending documents");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${API_URL}/api/doctor/approve-document/${documentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Document approved successfully");
        fetchPendingDocuments();
      }
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error("Failed to approve document");
    }
  };

  const handleReject = async (documentId) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${API_URL}/api/doctor/reject-document/${documentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Document rejected successfully");
        fetchPendingDocuments();
      }
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error("Failed to reject document");
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.studentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "all" || doc.type === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Documents
          </h1>
          <p className="mt-2 text-gray-600">
            Review and manage documents submitted by students
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by title, description, course, or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No pending documents
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no pending documents to review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <div key={doc._id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.title}
                        </h2>
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                          {doc.course}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-600 line-clamp-2">
                        {doc.description}
                      </p>
                      <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>
                            Submitted{" "}
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>{doc.type}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {doc.studentName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col sm:flex-row gap-2">
                      {doc.file && (
                        <a
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      )}
                      <button
                        onClick={() => handleApprove(doc._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(doc._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPendingDocuments;
