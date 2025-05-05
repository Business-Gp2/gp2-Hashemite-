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
} from "lucide-react";

const API_URL = "http://localhost:5000";

const DoctorAllDocuments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const fetchAllDocuments = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/doctor/all-documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error("Failed to fetch documents");
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
        fetchAllDocuments();
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
        fetchAllDocuments();
      }
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error("Failed to reject document");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filter === "all" || doc.type === filter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
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
          <h1 className="text-3xl font-bold text-gray-900">All Documents</h1>
          <p className="mt-2 text-gray-600">
            View and manage all student documents
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:col-span-1">
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
          <div className="sm:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
                No documents
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No documents match your search criteria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <div key={doc._id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.title}
                        </h2>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeColor(
                            doc.status
                          )}`}
                        >
                          {doc.status}
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
                            {new Date(doc.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>{doc.type}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {doc.studentName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col sm:flex-row gap-2">
                      {doc.file && (
                        <a
                          href={`${API_URL}${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      )}
                      {doc.status === "pending" && (
                        <>
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
                        </>
                      )}
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

export default DoctorAllDocuments;
