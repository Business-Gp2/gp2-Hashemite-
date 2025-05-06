import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DoctorLayout from "./DoctorLayout";
import { MessageCircle, Send, User, Plus, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000";

const DoctorMessages = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [newMessageStudent, setNewMessageStudent] = useState("");

  // Fetch students who have messaged this doctor
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`${API_URL}/api/messages/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          // Unique students from messages
          const uniqueStudents = [];
          const seen = new Set();
          response.data.messages.forEach((msg) => {
            if (!seen.has(msg.from._id) && msg.from._id !== user.id) {
              uniqueStudents.push(msg.from);
              seen.add(msg.from._id);
            }
          });
          setStudents(uniqueStudents);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user.id]);

  // Fetch conversation when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;
    const fetchConversation = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `${API_URL}/api/messages/conversation/${selectedStudent._id}`,
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
  }, [selectedStudent]);

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedStudent) return;
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/api/messages/reply`,
        { to: selectedStudent._id, content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyContent("");
      // Re-fetch conversation
      const response = await axios.get(
        `${API_URL}/api/messages/conversation/${selectedStudent._id}`,
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
    if (!newMessageContent.trim() || !newMessageStudent.trim()) return;
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/api/messages`,
        { to: newMessageStudent, content: newMessageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessageContent("");
      setNewMessageStudent("");
      setShowNewMessageForm(false);
      // Re-fetch students list
      const response = await axios.get(`${API_URL}/api/messages/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const uniqueStudents = [];
        const seen = new Set();
        response.data.messages.forEach((msg) => {
          if (!seen.has(msg.from._id) && msg.from._id !== user.id) {
            uniqueStudents.push(msg.from);
            seen.add(msg.from._id);
          }
        });
        setStudents(uniqueStudents);
      }
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
    <DoctorLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <MessageCircle className="mr-2 text-blue-600" size={24} />
              Student Messages
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
                    Select Student
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={newMessageStudent}
                    onChange={(e) => setNewMessageStudent(e.target.value)}
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
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
                  disabled={
                    !newMessageContent.trim() || !newMessageStudent.trim()
                  }
                >
                  <Send size={18} className="mr-2" /> Send Message
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Student List */}
              <div className="w-1/3 bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold mb-4">Students</h2>
                {students.length === 0 ? (
                  <div>No students have messaged you yet.</div>
                ) : (
                  <ul>
                    {students.map((student) => (
                      <li
                        key={student._id}
                        className={`cursor-pointer p-2 rounded mb-2 ${
                          selectedStudent && selectedStudent._id === student._id
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <User className="inline-block mr-2 text-blue-600" />
                        {student.firstName} {student.lastName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Conversation */}
              <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
                {selectedStudent ? (
                  <>
                    <h2 className="font-semibold mb-4">
                      Conversation with {selectedStudent.firstName}{" "}
                      {selectedStudent.lastName}
                    </h2>
                    <div className="flex-1 overflow-y-auto mb-4">
                      {conversation.length === 0 ? (
                        <div className="text-gray-500">No messages yet.</div>
                      ) : (
                        conversation.map((msg) => {
                          const isDoctor =
                            msg.from._id === user._id ||
                            msg.from._id === user.id;
                          return (
                            <div
                              key={msg._id}
                              className={`flex flex-col mb-2 ${
                                isDoctor ? "items-end" : "items-start"
                              }`}
                            >
                              <span className="text-xs font-semibold text-gray-500 mb-1">
                                {isDoctor
                                  ? `Dr. ${user.firstName} ${user.lastName}`
                                  : `${msg.from.firstName} ${msg.from.lastName}`}
                              </span>
                              <div
                                className={`flex ${
                                  isDoctor ? "justify-end" : "justify-start"
                                } w-full`}
                              >
                                <div
                                  className={`max-w-xs rounded-lg px-4 py-2 ${
                                    isDoctor
                                      ? "bg-blue-100 text-right ml-auto"
                                      : "bg-gray-100 text-left"
                                  }`}
                                >
                                  <p className="text-gray-800">{msg.content}</p>
                                </div>
                              </div>
                              <span
                                className={`text-xs text-gray-500 ${
                                  isDoctor ? "text-right" : "text-left"
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
                    Select a student to view the conversation.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorMessages;
