import React from 'react';

const Messages = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {/* Sample messages */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Sender Name</h3>
                <p className="text-gray-600">Message preview...</p>
              </div>
              <span className="text-sm text-gray-500">2h ago</span>
            </div>
          </div>
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Sender Name</h3>
                <p className="text-gray-600">Message preview...</p>
              </div>
              <span className="text-sm text-gray-500">1d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 