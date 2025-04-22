import React from 'react';

const Courses = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample course cards */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">Course 1</h3>
            <p className="text-gray-600 mt-2">Course description goes here</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">Course 2</h3>
            <p className="text-gray-600 mt-2">Course description goes here</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">Course 3</h3>
            <p className="text-gray-600 mt-2">Course description goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses; 