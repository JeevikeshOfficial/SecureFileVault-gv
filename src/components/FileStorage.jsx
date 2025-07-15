import React, { useState, useEffect } from "react";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
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
  const [userRole, setUserRole] = useState(null);
  const [publicFiles, setPublicFiles] = useState([]);
  const [adminFiles, setAdminFiles] = useState([]);
  const [publicUploadProgress, setPublicUploadProgress] = useState(0);
  const [adminUploadProgress, setAdminUploadProgress] = useState(0);
  const [publicSelectedFile, setPublicSelectedFile] = useState(null);
  const [adminSelectedFile, setAdminSelectedFile] = useState(null);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [uploadingPublic, setUploadingPublic] = useState(false);
  const [uploadingAdmin, setUploadingAdmin] = useState(false);
  const [isPublicDragOver, setIsPublicDragOver] = useState(false);
  const [isAdminDragOver, setIsAdminDragOver] = useState(false);

  // Handle automatic sign-out on tab close and inactivity
  useEffect(() => {
    // Sign out when browser tab is closed
    const handleTabClose = async () => {
      try {
        await signOut({ global: true }); // Global sign-out to clear all sessions
      } catch (error) {
        console.error("Error signing out on tab close:", error);
      }
    };

    // Inactivity timeout (15 minutes = 900000 ms)
    let inactivityTimeout;
    const resetInactivityTimeout = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(async () => {
        try {
          await signOut({ global: true }); // Global sign-out
          window.location.href = "/"; // Redirect to home or login page
        } catch (error) {
          console.error("Error signing out due to inactivity:", error);
        }
      }, 900000); // 15 minutes
    };

    // Reset timeout on user activity
    const handleUserActivity = () => {
      resetInactivityTimeout();
    };

    // Set up event listeners for user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    // Set up beforeunload event for tab closure
    window.addEventListener('beforeunload', handleTabClose);

    // Start the initial timeout
    resetInactivityTimeout();

    // Cleanup event listeners and timeout
    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      window.removeEventListener('beforeunload', handleTabClose);
      clearTimeout(inactivityTimeout);
    };
  }, []);

  // Fetch user session to get Cognito username and group
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const session = await fetchAuthSession();
        const name = session.tokens?.idToken?.payload?.["cognito:username"];
        const groups = session.tokens?.idToken?.payload?.["cognito:groups"] || [];
        setUsername(name || "Guest");
        // Determine role based on group membership
        if (groups.includes("admin")) {
          setUserRole("admin");
        } else if (groups.includes("editor")) {
          setUserRole("editor");
        } else if (groups.includes("viewer")) {
          setUserRole("viewer");
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUsername("Guest");
        setUserRole(null);
      }
    }
    loadUserInfo();
  }, []);

  // List files for a specific directory
  const fetchFiles = async (directory, setFiles, setLoading) => {
    try {
      setLoading(true);
      const fileList = await list({
        path: directory,
      });
      setFiles(fileList.items);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching files from ${directory}:`, error);
      setLoading(false);
    }
  };

  // Fetch files for public and admin directories based on role
  useEffect(() => {
    fetchFiles("public/", setPublicFiles, setLoadingPublic);
    if (userRole === "admin") {
      fetchFiles("admin/", setAdminFiles, setLoadingAdmin);
    }
  }, [userRole]);

  // Handle file selection
  const handleFileSelect = (e, setSelectedFile) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file drop
  const handleFileDrop = (e, setSelectedFile, setIsDragOver) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload file to specified directory
  const uploadFile = async (file, directory, setUploading, setUploadProgress, setSelectedFile) => {
    if (!file) return;

    try {
      setUploading(true);
      await uploadData({
        path: `${directory}${file.name}`,
        data: file,
        options: {
          onProgress: (progress) => {
            const progressPercentage = (progress.loaded / progress.total) * 100;
            setUploadProgress(progressPercentage);
          },
        },
      });
      setUploading(false);
      setSelectedFile(null);
      document.getElementById(directory === "public/" ? "public-file-input" : "admin-file-input").value = "";
      fetchFiles(
        directory,
        directory === "public/" ? setPublicFiles : setAdminFiles,
        directory === "public/" ? setLoadingPublic : setLoadingAdmin
      );
    } catch (error) {
      console.error(`Error uploading file to ${directory}:`, error);
      setUploading(false);
    }
  };

  // Download file
  const downloadFile = async (key) => {
    try {
      const result = await getUrl({
        path: key,
        options: {
          accessLevel: userRole === "admin" ? "protected" : "guest",
          download: true,
        },
      });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Delete file
  const deleteFile = async (key, directory) => {
    try {
      await remove({ path: key });
      if (directory === "public/") {
        fetchFiles("public/", setPublicFiles, setLoadingPublic);
      } else if (directory === "admin/") {
        fetchFiles("admin/", setAdminFiles, setLoadingAdmin);
      }
    } catch (error) {
      console.error(`Error deleting file from ${directory}:`, error);
    }
  };

  // Format file size
  const formatFileSize = (size) => {
    if (size < 1024) return size + " B";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    else return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Render upload section
  const renderUploadSection = (directory, selectedFile, setSelectedFile, uploading, setUploading, uploadProgress, setUploadProgress, isDragOver, setIsDragOver) => (
    <div className="upload-section">
      <h2>Upload Files to {directory === "public/" ? "Public" : "Admin"} Directory</h2>
      <div className="file-input-container">
        <input
          id={directory === "public/" ? "public-file-input" : "admin-file-input"}
          type="file"
          onChange={(e) => handleFileSelect(e, setSelectedFile)}
        />
        <label htmlFor={directory === "public/" ? "public-file-input" : "admin-file-input"} className="custom-file-input">
          <FontAwesomeIcon icon={faCloudUploadAlt} />
          <span>Choose a file or drag & drop here</span>
        </label>
        {selectedFile && (
          <div className="file-name-display">{selectedFile.name}</div>
        )}
      </div>
      <button
        onClick={() => uploadFile(selectedFile, directory, setUploading, setUploadProgress, setSelectedFile)}
        disabled={!selectedFile || uploading}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
          <span>{Math.round(uploadProgress)}%</span>
        </div>
      )}
    </div>
  );

  // Render files section
  const renderFilesSection = (directory, files, loading, setLoading, canDelete) => (
    <div className="files-section">
      <h2>{directory === "public/" ? "Public Files" : "Admin Files"}</h2>
      <button className="refresh-button" onClick={() => fetchFiles(directory, directory === "public/" ? setPublicFiles : setAdminFiles, setLoading)}>
        <FontAwesomeIcon icon={faSyncAlt} /> Refresh {directory === "public/" ? "Public" : "Admin"} Files
      </button>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faFolderOpen} />
          <p>No files found in {directory === "public/" ? "public" : "admin"} directory. Upload your first file!</p>
        </div>
      ) : (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file.path} className="file-item">
              <div className="file-info">
                <span className="file-name">
                  <FontAwesomeIcon icon={faFile} style={{ marginRight: "10px", color: "#5f72bd" }} />
                  {file.path.replace(directory, "")}
                </span>
                {file.size && <span className="file-size">{formatFileSize(file.size)}</span>}
              </div>
              <div className="file-actions">
                <button onClick={() => downloadFile(file.path)}>
                  <FontAwesomeIcon icon={faDownload} /> Download
                </button>
                {canDelete && (
                  <button onClick={() => deleteFile(file.path, directory)}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="app">
      <div className="header">
        <h1>Cloud Storage</h1>
        <div className="pill-action btn-dashboard" style={{ cursor: "default" }}>
          <FontAwesomeIcon icon={faUserCircle} /> {username} ({userRole || "No Role"})
        </div>
      </div>

      {/* Public Directory Section (visible to all roles) */}
      {userRole !== "viewer" && renderUploadSection(
        "public/",
        publicSelectedFile,
        setPublicSelectedFile,
        uploadingPublic,
        setUploadingPublic,
        publicUploadProgress,
        setPublicUploadProgress,
        isPublicDragOver,
        setIsPublicDragOver
      )}
      {renderFilesSection(
        "public/",
        publicFiles,
        loadingPublic,
        setLoadingPublic,
        userRole === "admin" || userRole === "editor"
      )}

      {/* Admin Directory Section (visible only to admin) */}
      {userRole === "admin" && renderUploadSection(
        "admin/",
        adminSelectedFile,
        setAdminSelectedFile,
        uploadingAdmin,
        setUploadingAdmin,
        adminUploadProgress,
        setAdminUploadProgress,
        isAdminDragOver,
        setIsAdminDragOver
      )}
      {userRole === "admin" && renderFilesSection(
        "admin/",
        adminFiles,
        loadingAdmin,
        setLoadingAdmin,
        true
      )}
    </div>
  );
}

export default FileStorage;
