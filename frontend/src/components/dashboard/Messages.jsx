import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";
import { MessageCircle, Send, User, Plus, X } from "lucide-react";

const API_URL = "http://localhost:5000";

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [newMessageDoctor, setNewMessageDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [conversation, setConversation] = useState([]);

  // Helper to fetch messages (for reuse)
  const fetchMessages = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(`${API_URL}/api/messages/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(`${API_URL}/api/doctor/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  // Fetch conversation when a doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;
    const fetchConversation = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `${API_URL}/api/messages/conversation/${selectedDoctor.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setConversation(response.data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch conversation:", error);
      }
    };
    fetchConversation();
  }, [selectedDoctor]);

  // Group messages by doctor
  const grouped = messages.reduce((acc, msg) => {
    const key = msg.from._id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedDoctor) return;
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/api/messages/reply`,
        { to: selectedDoctor.userId, content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyContent("");
      // Re-fetch conversation
      const response = await axios.get(
        `${API_URL}/api/messages/conversation/${selectedDoctor.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setConversation(response.data.messages);
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };

  const handleSendNewMessage = async () => {
    if (!newMessageContent.trim() || !newMessageDoctor.trim()) return;
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/api/messages`,
        { to: newMessageDoctor, content: newMessageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessageContent("");
      setNewMessageDoctor("");
      setShowNewMessageForm(false);
      fetchMessages(); // Re-fetch from backend for persistence
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageCircle className="mr-2 text-blue-600" size={24} />
            Conversations
          </h1>
          <button
            onClick={() => setShowNewMessageForm(!showNewMessageForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            {showNewMessageForm ? (
              <X size={18} className="mr-1" />
            ) : (
              <Plus size={18} className="mr-1" />
            )}
            {showNewMessageForm ? "Cancel" : "New Message"}
          </button>
        </div>

        {showNewMessageForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
            <h2 className="font-semibold mb-4 text-gray-700">
              Send a New Message
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={newMessageDoctor}
                  onChange={(e) => setNewMessageDoctor(e.target.value)}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.userId} value={doc.userId}>
                      Dr. {doc.firstName} {doc.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                  placeholder="Type your message here..."
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                />
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center ml-auto transition-colors duration-200"
                onClick={handleSendNewMessage}
                disabled={!newMessageContent.trim() || !newMessageDoctor.trim()}
              >
                <Send size={18} className="mr-2" /> Send Message
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Doctor List */}
          <div className="w-1/3 bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold mb-4">Doctors</h2>
            {doctors.length === 0 ? (
              <div>No doctors available.</div>
            ) : (
              <ul>
                {doctors.map((doctor) => (
                  <li
                    key={doctor.userId}
                    className={`cursor-pointer p-2 rounded mb-2 ${
                      selectedDoctor && selectedDoctor.userId === doctor.userId
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <User className="inline-block mr-2 text-blue-600" />
                    Dr. {doctor.firstName} {doctor.lastName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Conversation */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
            {selectedDoctor ? (
              <>
                <h2 className="font-semibold mb-4">
                  Conversation with Dr. {selectedDoctor.firstName}{" "}
                  {selectedDoctor.lastName}
                </h2>
                <div className="flex-1 overflow-y-auto mb-4">
                  {conversation.length === 0 ? (
                    <div className="text-gray-500">No messages yet.</div>
                  ) : (
                    conversation.map((msg) => {
                      const isDoctor = msg.from._id === selectedDoctor.userId;
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col mb-2 ${
                            isDoctor ? "items-start" : "items-end"
                          }`}
                        >
                          <span className="text-xs font-semibold text-gray-500 mb-1">
                            {isDoctor
                              ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                              : `${user.firstName} ${user.lastName}`}
                          </span>
                          <div
                            className={`flex ${
                              isDoctor ? "justify-start" : "justify-end"
                            } w-full`}
                          >
                            <div
                              className={`max-w-xs rounded-lg px-4 py-2 ${
                                isDoctor
                                  ? "bg-gray-100 text-left"
                                  : "bg-blue-100 text-right ml-auto"
                              }`}
                            >
                              <p className="text-gray-800">{msg.content}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs text-gray-500 ${
                              isDoctor ? "text-left" : "text-right"
                            } w-full`}
                          >
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                  >
                    <Send size={18} className="mr-1" /> Send
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500 flex items-center h-full justify-center">
                Select a doctor to view the conversation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
