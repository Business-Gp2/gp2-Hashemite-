import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import DoctorLayout from "./DoctorLayout";
import { MessageSquare, Send, Search, Clock, User, Trash2 } from "lucide-react";

const API_URL = "http://localhost:5000";

const DoctorMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/doctor/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !newMessage.trim()) return;

    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${API_URL}/api/doctor/messages/${selectedMessage.studentId}`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setNewMessage("");
        fetchMessages();
        toast.success("Message sent successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const token = Cookies.get("token");
      const response = await axios.delete(
        `${API_URL}/api/doctor/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchMessages();
        toast.success("Message deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      msg.studentName.toLowerCase().includes(searchLower) ||
      msg.content.toLowerCase().includes(searchLower)
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">Communicate with your students</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No messages
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No messages found.
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <button
                    key={msg._id}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedMessage?._id === msg._id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {msg.studentName}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(msg._id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            {selectedMessage ? (
              <div className="flex flex-col h-[calc(100vh-300px)]">
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedMessage.studentName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Student ID: {selectedMessage.studentId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedMessage.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender === "doctor"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender === "doctor"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-300px)]">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No message selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a message from the list to view its details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorMessages;
