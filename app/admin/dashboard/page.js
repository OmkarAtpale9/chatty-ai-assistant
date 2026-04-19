"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  // States
  const [collectionName, setCollectionName] = useState("");
  const [existingCollections, setExistingCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const [message, setMessage] = useState("");

  // Fetch collections from DB
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("/api/get-collections");
        const data = await res.json();
        setExistingCollections(data.collections || []);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };
    fetchCollections();
  }, []);

  // Logout
  const handleLogout = () => {
    router.push("/admin/login");
  };

  // Create Collection
  const createCollection = async () => {
    if (!collectionName) return;
    await fetch("/api/create-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionName }),
    });
    setMessage(`Collection "${collectionName}" created!`);
    setCollectionName("");
  };

  // Upload Single File to Selected Collection
  const uploadFile = async (file, endpoint) => {
    if (!file || !selectedCollection) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collectionName", selectedCollection);
    await fetch(endpoint, { method: "POST", body: formData });
  };

  // Upload All
  const handleUploadAll = async () => {
    setMessage("Uploading...");
    await createCollection();
    await uploadFile(pdfFile, "/api/upload");
    await uploadFile(imageFile, "/api/upload-image");
    await uploadFile(docFile, "/api/upload-doc");
    setMessage("All data uploaded successfully!");
    setCollectionName("");
    setPdfFile(null);
    setImageFile(null);
    setDocFile(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-700 text-white flex flex-col justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center">Admin Panel</h1>
          <ul className="space-y-4">
            <li className="hover:bg-gray-600 px-4 py-2 rounded cursor-pointer">
              Dashboard
            </li>

            {/* User Dropdown */}
            <li
              className="relative hover:bg-gray-600 px-4 py-2 rounded cursor-pointer"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              Users ▾
              {showUserDropdown && (
                <div className="absolute left-full top-0 ml-2 bg-white text-black rounded shadow-lg w-32">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Profile
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </li>

            <li className="hover:bg-gray-600 px-4 py-2 rounded cursor-pointer">
              Settings
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 relative">

        <div className="flex flex-col space-y-8 w-full max-w-xl">

          {/* Create Collection */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Create Collection</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter collection name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="flex-1 border border-gray-400 px-3 py-2 rounded font-semibold text-black focus:outline-none"
              />
              <button
                onClick={createCollection}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Create
              </button>
            </div>
          </div>

          {/* Select Existing Collection */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Select Collection to Upload</h3>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full border border-gray-400 px-3 py-2 rounded font-semibold text-black focus:outline-none"
            >
              <option value="">-- Select Collection --</option>
              {existingCollections.map((col, idx) => (
                <option key={idx} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Upload PDF */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload PDF</h3>
            <div className="flex space-x-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="flex-1 border border-gray-400 px-3 py-2 rounded font-semibold text-black focus:outline-none"
              />
              <button
                onClick={() => uploadFile(pdfFile, "/api/upload")}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Upload
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Accepted format: .pdf</p>
          </div>

          {/* Upload Image */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Image</h3>
            <div className="flex space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="flex-1 border border-gray-400 px-3 py-2 rounded font-semibold text-black focus:outline-none"
              />
              <button
                onClick={() => uploadFile(imageFile, "/api/upload-image")}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Upload
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Accepted formats: .jpg, .png</p>
          </div>

          {/* Upload Document */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Document</h3>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".doc,.docx,.txt"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="flex-1 border border-gray-400 px-3 py-2 rounded font-semibold text-black focus:outline-none"
              />
              <button
                onClick={() => uploadFile(docFile, "/api/upload-doc")}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Upload
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Accepted formats: .doc, .docx, .txt</p>
          </div>

        </div>

        {/* Upload All Button */}
        <div className="absolute right-10 bottom-10">
          <button
            onClick={handleUploadAll}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Upload All
          </button>
          {message && <p className="text-green-600 mt-3">{message}</p>}
        </div>
      </div>
    </div>
  );
}
