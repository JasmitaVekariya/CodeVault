import React, { useState } from "react";
import axios from "axios";
// --- ICONS ---
import { 
  FaFolder, 
  FaUpload, 
  FaFile, 
  FaPlus, 
  FaClipboardList, 
  FaClock, 
  FaRocket 
} from "react-icons/fa";

// --- SET YOUR LIMIT HERE ---
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FileUploadCommit = ({ user, repo, onCommitSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [commitFiles, setCommitFiles] = useState([]);
  const [commitMsg, setCommitMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      'user-id': localStorage.getItem('userId')
    }
  });

  // --- THIS FUNCTION IS UPDATED ---
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const oversizedFiles = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    // Show an alert if any files were too large
    if (oversizedFiles.length > 0) {
      alert(
        `The following files are too large (Max ${MAX_FILE_SIZE_MB}MB):\n\n` +
        oversizedFiles.join("\n")
      );
    }
    
    // Add only the valid files
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  // Step 2: move to commit box
  const handleAddToCommit = () => {
    setCommitFiles([...commitFiles, ...selectedFiles]);
    setSelectedFiles([]);
  };

  // Step 3: Commit + Push
  const handleCommitAndPush = async () => {
    if (!commitFiles.length || !commitMsg) {
      alert("Please add files and enter a commit message");
      return;
    }

    try {
      setUploading(true);

      // 1. Upload actual files into staging
      const formData = new FormData();
      commitFiles.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/repo/${user}/${repo}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2. Commit staged files
      await api.post(`/repo/${user}/${repo}/commit`, { message: commitMsg });

      // 3. Push to S3
      await api.post(`/repo/${user}/${repo}/push`);

      alert("Files committed and pushed successfully!");
      setCommitFiles([]);
      setCommitMsg("");
      
      // Notify parent component to refresh commits
      if (onCommitSuccess) {
        onCommitSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to push files");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Box 1: Add Files */}
      <div style={styles.box}>
        <div style={styles.boxHeader}>
          <h3 style={styles.boxTitle}>
            <FaFolder style={styles.titleIcon} /> Add Files
          </h3>
          <p style={styles.boxSubtitle}>Select files to add to your repository</p>
        </div>
        
        <div style={styles.fileInputContainer}>
          <input 
            type="file" 
            multiple 
            onChange={handleFileSelect}
            style={styles.fileInput}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={styles.fileInputLabel}>
            <FaUpload style={styles.uploadIcon} />
            Choose Files
          </label>
        </div>
        
        {selectedFiles.length > 0 && (
          <div style={styles.selectedFilesContainer}>
            <h4 style={styles.selectedFilesTitle}>Selected Files:</h4>
            <div style={styles.filesList}>
              {selectedFiles.map((f, idx) => (
                <div key={idx} style={styles.fileItem}>
                  <FaFile style={styles.fileIcon} />
                  <span style={styles.fileName}>{f.name}</span>
                </div>
              ))}
            </div>
            <button onClick={handleAddToCommit} style={styles.addButton}>
              <FaPlus style={styles.buttonIcon} /> Add to Commit
            </button>
          </div>
        )}
      </div>

      {/* Box 2: Commit Box */}
      <div style={styles.box}>
        <div style={styles.boxHeader}>
          <h3 style={styles.boxTitle}>
            <FaClipboardList style={styles.titleIcon} /> Commit Box 
          </h3>
          <p style={styles.boxSubtitle}>Review and commit your changes</p>
        </div>
        
        {commitFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No files to commit</p>
            <p style={styles.emptySubtext}>Add some files first to get started</p>
          </div>
        ) : (
          <div style={styles.commitContainer}>
            <div style={styles.commitFilesList}>
              <h4 style={styles.commitFilesTitle}>Files to commit:</h4>
              <div style={styles.filesList}>
                {commitFiles.map((f, idx) => (
                  <div key={idx} style={styles.fileItem}>
                    <FaFile style={styles.fileIcon} />
                    <span style={styles.fileName}>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={styles.messageContainer}>
              <label style={styles.messageLabel}>Commit Message:</label>
              <textarea
                placeholder="Enter a descriptive commit message..."
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                style={styles.messageInput}
              />
            </div>
            
            <button 
              onClick={handleCommitAndPush} 
              disabled={uploading}
              style={uploading ? styles.pushButtonDisabled : styles.pushButton}
            >
              {uploading ? (
                <>
                  <FaClock style={styles.buttonIcon} /> Pushing...
                </>
              ) : (
                <>
                  <FaRocket style={styles.buttonIcon} /> Commit & Push
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES (Unchanged) ---
const styles = {
  container: {
    display: "flex",
    gap: "24px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  box: {
    flex: 1,
    minWidth: "300px",
    border: "1px solid #30363d",
    borderRadius: "6px",
    padding: "28px",
    backgroundColor: "#161b22",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  boxHeader: {
    marginBottom: "24px",
    textAlign: "center",
  },
  boxTitle: {
    fontSize: "24px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#c9d1d9",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
  },
  boxSubtitle: {
    fontSize: "16px",
    color: "#8b949e",
    margin: 0,
    fontWeight: "500",
  },
  titleIcon: {
    marginRight: "10px",
  },
  buttonIcon: {
    marginRight: "8px",
    verticalAlign: "middle", 
  },
  fileInputContainer: {
    position: "relative",
    marginBottom: "20px",
  },
  fileInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
  },
  fileInputLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    border: "2px dashed #30363d",
    borderRadius: "6px",
    backgroundColor: "#21262d",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "16px",
    color: "#8b949e",
  },
  uploadIcon: {
    fontSize: "32px",
    marginBottom: "12px",
    color: "#c9d1d9", 
  },
  selectedFilesContainer: {
    marginTop: "20px",
  },
  selectedFilesTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: "0 0 16px 0",
  },
  commitFilesTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: "0 0 16px 0",
  },
  filesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  fileItem: { 
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#21262d",
    borderRadius: "6px",
    border: "1px solid #30363d",
    transition: "all 0.2s ease",
    overflow: "hidden",
  },
  fileIcon: {
    fontSize: "16px",
    color: "#8b949e", 
    flexShrink: 0,
  },
  fileName: { 
    fontSize: "15px",
    fontWeight: "500",
    color: "#c9d1d9",
    flex: 1,
    minWidth: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  addButton: { 
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "#3a4251", // Navy button
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
  },
  emptyState: { 
    textAlign: "center",
    padding: "40px 20px",
    color: "#8b949e",
  },
  emptyIcon: { 
    fontSize: "48px",
    display: "block",
    marginBottom: "16px",
    color: "#c9d1d9", 
  },
  emptyText: { 
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#c9d1d9",
  },
  emptySubtext: { 
    fontSize: "14px",
    margin: 0,
    color: "#8b949e",
  },
  commitContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  commitFilesList: { 
    backgroundColor: "#0d1117",
    padding: "20px",
    borderRadius: "6px",
    border: "1px solid #30363d",
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  messageLabel: { 
    fontSize: "16px",
    fontWeight: "600",
    color: "#c9d1d9",
  },
  messageInput: { 
    width: "100%",
    minHeight: "80px",
    padding: "16px",
    border: "1px solid #30363d",
    borderRadius: "6px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s ease",
    backgroundColor: "#0d1117",
    color: "#c9d1d9",
  },
  pushButton: { 
    width: "100%",
    padding: "16px 24px",
    background: "#3a4251", // Navy button
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(53, 62, 76, 0.7)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
  },
  pushButtonDisabled: { 
    width: "100%",
    padding: "16px 24px",
    backgroundColor: "#21262d",
    color: "#8b949e",
    border: "none",
    borderRadius: "6px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "not-allowed",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
  },
};

export default FileUploadCommit;