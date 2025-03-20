import React from "react";
import ProfileWithAPI from "../navigation_pages/ProfileWithAPI";

const ProfileApiTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Backend API Test Page
        </h1>
        <p className="text-gray-600">
          This page demonstrates using the new backend API to fetch profile data
          instead of making direct Supabase calls from the frontend.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
          <p className="text-amber-700">
            <span className="font-bold">Note:</span> Make sure the backend
            server is running at http://localhost:8080
          </p>
        </div>
      </div>

      <ProfileWithAPI />
    </div>
  );
};

export default ProfileApiTest;
