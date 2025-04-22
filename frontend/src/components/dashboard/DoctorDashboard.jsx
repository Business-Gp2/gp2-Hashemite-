import React from "react";
import { useAuth } from "../../context/AuthContext";

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome Doctor {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-lg text-gray-600">
            This is your doctor dashboard. Here you can manage your courses,
            create assignments, and interact with students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
