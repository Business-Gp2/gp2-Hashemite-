import React from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Clock, Users, Calendar } from "lucide-react";

const Courses = () => {
  const { user } = useAuth();

  const courseDetails = {
    "CS101": {
      name: "Introduction to Computer Science",
      description: "Fundamental concepts of computer science and programming",
      schedule: "Monday & Wednesday, 10:00 AM - 11:30 AM",
      instructor: "Dr. Ahmed Mohammed",
      students: 45
    },
    "MATH201": {
      name: "Advanced Mathematics",
      description: "Advanced mathematical concepts and problem-solving techniques",
      schedule: "Tuesday & Thursday, 1:00 PM - 2:30 PM",
      instructor: "Dr. Sarah Johnson",
      students: 38
    },
    "ENG105": {
      name: "English Composition",
      description: "Advanced writing and communication skills",
      schedule: "Monday & Wednesday, 2:00 PM - 3:30 PM",
      instructor: "Prof. Michael Brown",
      students: 42
    },
    "WEB ADVANCE": {
      name: "Advanced Web Development",
      description: "Modern web development techniques and frameworks",
      schedule: "Tuesday & Thursday, 10:00 AM - 11:30 AM",
      instructor: "Dr. Omar Hassan",
      students: 35
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Courses</h1>
          <p className="text-lg text-gray-600">
            View and manage your enrolled courses
          </p>
        </div>

        {user?.courses && user.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.courses.map((courseCode) => {
              const course = courseDetails[courseCode];
              return (
                <div
                  key={courseCode}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {courseCode}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-2 text-indigo-500" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                        <span>{course.students} Students Enrolled</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                        onClick={() => window.location.href = `/dashboard/upload-document?course=${courseCode}`}
                      >
                        Upload Document
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No courses enrolled</h3>
            <p className="mt-1 text-gray-500">
              You haven't enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses; 