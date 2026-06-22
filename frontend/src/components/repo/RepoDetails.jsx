import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import {
  FaUserCircle,
  FaStar,
  FaRegStar, // Imported for toggle
  FaSyncAlt,
  FaPlusCircle,
  FaBook,
  FaLock,
  FaGlobe,
  FaFile,
  FaHistory,
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaCodeBranch, // Added for stats
  FaEye, // Added for stats
} from "react-icons/fa";
import axios from "axios";
import FileUploadCommit from "./filesAdding"; // This component is still imported

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RepositoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [expandedCommits, setExpandedCommits] = useState(new Set());
  const [downloadingLatest, setDownloadingLatest] = useState(false);
  // Handle revert commit with proper feedback and button disable state
  const [reverting, setReverting] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json", ...authHeader },
  });

  // --- All logic from the complex file is retained ---

  const fetchCommits = async (owner, repoName) => {
    try {
      setCommitsLoading(true);
      const response = await api.get(`/repo/${owner}/${repoName}/commits`);
      if (response.data.success) {
        const sortedCommits = response.data.commits.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setCommits(sortedCommits);
      }
    } catch (err) {
      console.error("Error fetching commits:", err);
    } finally {
      setCommitsLoading(false);
    }
  };

  const toggleCommitExpansion = (commitId) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(commitId)) {
      newExpanded.delete(commitId);
    } else {
      newExpanded.add(commitId);
    }
    setExpandedCommits(newExpanded);
  };

  // Download latest commit as ZIP
  const downloadLatestCommit = async () => {
    if (!repo || !repo.owner || !repo.name) return;
    setDownloadingLatest(true);
    try {
      const response = await fetch(
        `${API_BASE}/repo/${repo.owner.username}/${repo.name}/download/latest`,
        {
          method: 'GET',
          headers: {
            'user-id': localStorage.getItem('userId')
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to download latest commit');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${repo.name}-latest.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading latest commit:', error);
      alert('Failed to download latest commit. Please try again.');
    } finally {
      setDownloadingLatest(false);
    }
  };

// Handle revert commit with proper feedback and button disable state
const handleRevert = async (commitId) => {
  if (!repo?.owner?.username || !repo?.name) {
    alert("Repository not found!");
    return;
  }

  const confirmRevert = window.confirm(
    `⚠️ Are you sure you want to revert "${repo.name}" back to Commit ${commitId}?`
  );
  if (!confirmRevert) return;

  setReverting(true);

  try {
    console.log(
      "📡 Calling:",
      `${API_BASE}/repo/${repo.owner.username}/${repo.name}/revert/${commitId}`
    );

    const response = await fetch(
      `${API_BASE}/repo/${repo.owner.username}/${repo.name}/revert/${commitId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": localStorage.getItem("userId"),
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`✅ ${data.message}`);
      await fetchCommits(repo.owner.username, repo.name);
    } else {
      alert(`❌ ${data.error || "Failed to revert. Please try again."}`);
    }
  } catch (error) {
    console.error("❌ Error reverting repository:", error);
    alert("⚠️ Something went wrong while reverting the repository.");
  } finally {
    setReverting(false);
  }
};


  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const response = await api.get(`/repo/${id}`);
        if (!response.data) throw new Error("No repo data");

        setRepo(response.data);

        const userRes = await api.get(`/userProfile/${userId}`);
        const starred = (userRes.data.starredRepos || []).some(
          (r) => r.toString() === id
        );
        setIsStarred(starred);

        if (response.data.owner?.username) {
          fetchCommits(response.data.owner.username, response.data.name);
        }
      } catch (err) {
        console.error("Error fetching repo details:", err);
        setError("Failed to load repository details");
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
  }, [id, userId]);

  const toggleStar = async () => {
    try {
      const res = await api.post("/star", { userId, repoId: id });
      setIsStarred(res.data.isStarred);
      setRepo((prev) => ({ ...prev, stars: res.data.stars }));
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading repository...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <>
      <Navbar />
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Header (From Simple) */}
          <div style={styles.headerRow}>
            <h2 style={styles.repoName}>
              <span style={styles.blueText}>{repo?.name}</span>
            </h2>
            <div style={styles.ownerInfo}>
              <FaUserCircle size={20} style={{ marginRight: 6 }} />
              <span>Owner: {repo?.owner?.username}</span>
            </div>
          </div>

          {/* Visibility Badge (Merged) */}
          <div style={styles.visibilityBadge}>
            {repo?.isPublic || repo?.visibility === true ? (
              <>
                <FaGlobe size={14} color="#58a6ff" />
                <span>Public Repository</span>
              </>
            ) : (
              <>
                <FaLock size={14} color="#f85149" />
                <span>Private Repository</span>
              </>
            )}
          </div>

          {/* Description (From Simple) */}
          <p style={styles.desc}>
            {repo?.description || "No description available"}
          </p>

          {/* Dates (From Simple, uncommented) */}
          {/* <p style={styles.metaText}>
            Created: {new Date(repo?.createdAt).toLocaleDateString()}
          </p>
          <p style={styles.metaText}>
            Updated: {new Date(repo?.updatedAt).toLocaleDateString()}
          </p> */}

          {/* Stats Row (From Simple, logic from Complex) */}
          <div style={styles.statsRow}>
            <div
              style={styles.statItem}
              onClick={toggleStar}
            >
              {isStarred ? (
                <FaStar color="gold" />
              ) : (
                <FaRegStar color="#c9d1d9" />
              )}
              <span>{repo?.stars || 0}</span>
            </div>
            {/* <div style={styles.statItem}>
              <FaCodeBranch /> <span>{repo?.forks || 0}</span>
            </div>
            <div style={styles.statItem}>
              <FaEye /> <span>{repo?.views || 0}</span>
            </div> */}
          </div>

          {/* Actions Row (From Simple, logic from Complex) */}
          <div style={styles.actionRow}>
            {repo?.owner?._id?.toString() === userId && (
              <div
                style={styles.actionItem}
                onClick={() => navigate(`/repository/update/${repo._id}`)}
              >
                <FaSyncAlt size={16} style={styles.icon} />
                Update Repository
              </div>
            )}
            <div
              style={styles.actionItem}
              onClick={() => navigate(`/repository/${id}/issue/create`)}
            >
              <FaPlusCircle size={16} style={styles.icon} />
              Create New Issue
            </div>
            <div
              style={styles.actionItem}
              onClick={() => navigate(`/repository/${id}/issues`)}
            >
              <FaBook size={16} style={styles.icon} />
              View Issues
            </div>
          </div>

          {/* File Upload & Commit Section (From Complex) */}
          {repo && repo.owner && userId && repo.owner._id === userId && (
            <div style={{ marginTop: "30px" }}>
              <div style={styles.sectionHeader}>
                <h3 style={{ margin: 0 }}>Manage Files</h3>
              </div>
              <FileUploadCommit 
                user={repo.owner.username} 
                repo={repo.name} 
                onCommitSuccess={() => fetchCommits(repo.owner.username, repo.name)}
              />
            </div>
          )}
          
          {/* Commits History Section (From Complex, styled with Simple) */}
          <div style={{ marginTop: "40px" }}>
            <div style={styles.sectionHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaHistory />
                <h3 style={{ margin: 0 }}>Commit History</h3>
              </div>
              <button
                style={{
                  ...styles.latestDownloadButton,
                  opacity: downloadingLatest ? 0.7 : 1,
                  cursor: downloadingLatest ? "not-allowed" : "pointer",
                }}
                onClick={downloadLatestCommit}
                disabled={downloadingLatest}
                title="Download latest commit as ZIP"
              >
                {downloadingLatest ? (
                  <div style={styles.spinner} />
                ) : (
                  <>
                    <FaDownload size={16} style={{ marginRight: 6 }} />
                    Download Latest Commit
                  </>
                )}
              </button>
            </div>

            {commitsLoading ? (
              <div style={styles.loading}>Loading commits...</div>
            ) : commits.length === 0 ? (
              <div style={styles.noCommits}>No commits yet</div>
            ) : (
              <div style={styles.commitsContainer}>
                {commits.map((commit, index) => (
                  <div key={commit.commitId} style={styles.commitItem}>
                    <div style={styles.commitHeader}>
                      <div
                        style={styles.commitHeaderLeft}
                        onClick={() => toggleCommitExpansion(commit.commitId)}
                      >
                        {expandedCommits.has(commit.commitId) ? (
                          <FaChevronDown style={styles.expandIcon} />
                        ) : (
                          <FaChevronRight style={styles.expandIcon} />
                        )}
                        <span style={styles.commitNumber}>
                          #{commits.length - index}
                        </span>
                        <div style={styles.commitContent}>
                          <div style={styles.commitMessage}>
                            {commit.message}
                            {index === 0 && (
                              <span style={styles.latestBadge}>Latest</span>
                            )}
                          </div>
                          <div style={styles.commitMeta}>
                            {new Date(commit.timestamp).toLocaleString()} • {commit.files.length} file(s)
                          </div>
                        </div>
                      </div>
                      <button
                        style={{
                          ...styles.revertButton,
                          opacity: reverting ? 0.6 : 1,
                          cursor: reverting ? "not-allowed" : "pointer",
                        }}
                        onClick={() => handleRevert(commit.id || commit.commitId)}
                        disabled={reverting}
                      >
                        {reverting ? "Reverting..." : "Revert"}
                      </button>
                    </div>

                    {expandedCommits.has(commit.commitId) && (
                      <div style={styles.commitFiles}>
                        <div style={styles.filesHeader}>Files in this commit:</div>
                        <div style={styles.filesList}>
                          {commit.files.map((file, fileIndex) => (
                            <div key={fileIndex} style={styles.fileItem}>
                              <FaFile style={styles.fileIcon} />
                              <span>{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// --- STYLES (Simple styles + new styles for commits) ---
const styles = {
  // Styles from the simple file
  wrapper: {
    paddingTop: "0px",
    backgroundColor: "#0d1117",
    height: "100%",
    minHeight: "100vh", // <-- THIS WAS THE FIX
    padding: "100px 20px 30px",
    width: "100%",
    color: "#c9d1d9",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "10px",
    padding: "25px 30px",
    margin: "0 auto",
    maxWidth: "800px", // Increased width to fit more content
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.4)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  repoName: {
    fontSize: "22px",
    fontWeight: 700,
    margin: 0,
  },
  blueText: {
    color: "#58a6ff",
  },
  ownerInfo: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#c9d1d9",
  },
  visibilityBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "12px",
    color: "#c9d1d9",
  },
  desc: {
    fontSize: "16px",
    color: "#8b949e",
    marginBottom: 16,
  },
  metaText: {
    fontSize: "14px",
    color: "#8b949e",
    marginBottom: 4,
  },
  statsRow: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "30px",
    marginTop: 20,
    marginBottom: 25,
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "14px",
    color: "#c9d1d9",
    cursor: "pointer", // Added
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-start", // Changed
    marginTop: 10,
    gap: 12,
    flexWrap: "wrap",
  },
  actionItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#c9d1d9",
    fontWeight: 500,
    borderRadius: "6px",
    padding: "10px 14px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    fontSize: "14px",
    backgroundColor: "#21262d", // Added
    border: "1px solid #30363d", // Added
  },
  icon: {
    color: "#58a6ff", // Changed
  },
  loading: {
    textAlign: "center",
    padding: "30px",
    fontSize: "18px",
    color: "#8b949e", // Added
  },
  error: {
    textAlign: "center",
    padding: "30px",
    color: "#f85149",
    fontSize: "18px",
  },

  // --- New styles added for commit history ---
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid #30363d",
    color: "#58a6ff", // Matched blueText
    fontSize: "18px",
    fontWeight: "600",
  },
  commitsContainer: {
    border: "1px solid #30363d",
    borderRadius: "6px",
    marginTop: "16px",
    maxHeight: "600px",
    overflowY: "auto",
    backgroundColor: "#0d1117",
  },
  commitItem: {
    borderBottom: "1px solid #30363d",
  },
  commitHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
  },
  commitHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    flex: 1,
    minWidth: 0,
  },
  expandIcon: { 
    color: "#8b949e",
    fontSize: "12px",
  },
  commitNumber: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8b949e",
  },
  commitContent: {
    flex: 1,
    minWidth: 0,
  },
  commitMessage: {
    color: "#c9d1d9",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  latestBadge: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#3fb950",
    backgroundColor: "#21262d",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  commitMeta: {
    fontSize: "12px",
    color: "#8b949e",
    marginTop: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  commitDownloadButton: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#58a6ff",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    minWidth: "36px",
    height: "30px",
    // This button is now unused, but kept for reference.
  },
  latestDownloadButton: {
    background: "#238636",
    border: "none",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 2px 8px rgba(63,185,80,0.10)",
    transition: "background 0.2s",
    gap: "5px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #58a6ff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  commitFiles: {
    backgroundColor: "#0d1117",
    padding: "16px",
    borderTop: "1px solid #30363d",
  },
  filesHeader: {
    color: "#c9d1d9",
    fontWeight: "600",
    marginBottom: "10px",
  },
  filesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",

    color: "#8b949e",
    fontSize: "14px",
  },
  fileIcon: { 
    color: "#8b949e",
    fontSize: "14px",
  },
  noCommits: {
    textAlign: "center",
    padding: "20px",
    color: "#8b949e",
    fontStyle: "italic",
    background: "#21262d",
    borderRadius: "6px",
  },
  revertButton: {
    background: "#f85149",
    border: "none",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    marginLeft: "12px",
    transition: "background 0.2s, opacity 0.2s",
  },
};

// Add CSS animation for spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default RepositoryDetails;