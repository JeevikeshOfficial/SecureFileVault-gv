import React, { useState, useEffect } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { uploadData, getUrl, remove, list } from "aws-amplify/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faDownload,
  faTrashAlt,
  faSyncAlt,
  faFile,
  faFolderOpen,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

function FileStorage() {
  const [username, setUsername] = useState("Guest");
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch user session to get Cognito username
  useEffect(() => {
    async function loadUsername() {
      try {
        const session = await fetchAuthSession();
        const name = session.tokens?.idToken?.payload?.["cognito:username"];
        setUsername(name || "Guest");
      } catch {
        setUsername("Guest");
      }
    }
    loadUsername();
  }, []);

  // List files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const fileList = await list("");
      setFiles(fileList.items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  // Upload file
  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await uploadData({
        key: selectedFile.name,
        data: selectedFile,
        onProgress: (progress) => {
          const progressPercentage = (progress.loaded / progress.total) * 100;
          setUploadProgress(progressPercentage);
        },
      });

      setUploading(false);
      setSelectedFile(null);
      document.getElementById("file-input").value = "";
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  // Download file
  const downloadFile = async (key) => {
    try {
      const result = await getUrl({
        key: key,
        options: {
          accessLevel: "guest",
          download: true,
        },
      });

      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Delete file
  const deleteFile = async (key) => {
    try {
      await remove({ key: key });
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  // Format file size
  const formatFileSize = (size) => {
    if (size < 1024) return size + " B";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    else return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Cloud Storage</h1>
        <div className="pill-action btn-dashboard" style={{ cursor: "default" }}>
          <FontAwesomeIcon icon={faUserCircle} /> {username}
        </div>
      </div>

      <div className="upload-section">
        <h2>Upload Files</h2>
        <div className="file-input-container">
          <input id="file-input" type="file" onChange={handleFileSelect} />
          <label htmlFor="file-input" className="custom-file-input">
            <FontAwesomeIcon icon={faCloudUploadAlt} />
            <span>Choose a file or drag & drop here</span>
          </label>
          {selectedFile && (
            <div className="file-name-display">{selectedFile.name}</div>
          )}
        </div>
        <button onClick={uploadFile} disabled={!selectedFile || uploading}>
          {uploading ? "Uploading..." : "Upload File"}
        </button>
        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        )}
      </div>

      <div className="files-section">
        <h2>Your Files</h2>
        <button className="refresh-button" onClick={fetchFiles}>
          <FontAwesomeIcon icon={faSyncAlt} /> Refresh Files
        </button>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faFolderOpen} />
            <p>No files found. Upload your first file!</p>
          </div>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.key} className="file-item">
                <div className="file-info">
                  <span className="file-name">
                    <FontAwesomeIcon
                      icon={faFile}
                      style={{ marginRight: "10px", color: "#5f72bd" }}
                    />
                    {file.key}
                  </span>
                  {file.size && (
                    <span className="file-size">
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </div>
                <div className="file-actions">
                  <button onClick={() => downloadFile(file.key)}>
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </button>
                  <button onClick={() => deleteFile(file.key)}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FileStorage;
