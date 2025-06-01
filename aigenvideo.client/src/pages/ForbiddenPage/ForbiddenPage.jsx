import React from 'react';

function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-medium text-black">403</h1>
        <div className="h-12 w-px bg-gray-300"></div>
        <p className="text-sm text-black">Access to this resource is forbidden.</p>
      </div>
    </div>
  );
}

export default ForbiddenPage;
