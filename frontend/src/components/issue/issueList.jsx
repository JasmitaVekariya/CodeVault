import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaTrashAlt, FaPen, FaBug, FaPlus, FaCircle, FaChevronRight, FaExclamationCircle } from "react-icons/fa";

const IssueList = () => {
  const { id: repositoryId } = useParams();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repoName, setRepoName] = useState(""); // For displaying "archirepo > Issues"

  // Fetch issues
  const fetchIssues = async () => {
    try {
      const res = await fetch(`http://localhost:3000/issue/all/${repositoryId}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setIssues(data.issues || []);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch repository name
  const fetchRepo = async () => {
    try {
      const res = await fetch(`http://localhost:3000/repo/${repositoryId}`);
      if (!res.ok) throw new Error("Repo fetch failed");
      const data = await res.json();
      setRepoName(data.name || "Repository");
    } catch (err) {
      console.error("Error fetching repo:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchRepo();
  }, [repositoryId]);

  const handleDelete = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const res = await fetch(`http://localhost:3000/issue/delete/${issueId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setIssues((prev) => prev.filter((i) => i._id !== issueId));
    } catch (err) {
      alert("Failed to delete issue");
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading issues...</p>
        </div>
      </div>
    </>
  );
  
  if (error) return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <FaExclamationCircle style={styles.errorIcon} />
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.breadcrumb}>
            <span
              style={styles.repoName}
              onClick={() => navigate(`/repository/${repositoryId}`)}
            >
              {repoName}
            </span>
            <FaChevronRight style={styles.separator} />
            <span style={styles.currentPage}>Issues</span>
          </div>

          <button
            style={styles.newIssueBtn}
            onClick={() => navigate(`/repository/${repositoryId}/issue/create`)}
          >
            <FaPlus style={{ marginRight: "8px" }} />
            New Issue
          </button>
        </div>

        <div style={styles.issuesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <FaBug style={styles.sectionIcon} />
              Issues
            </h2>
            <div style={styles.issueCount}>
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </div>
          </div>

          <div style={styles.issueList}>
            {issues.length === 0 ? (
              <div style={styles.emptyState}>
                <FaBug style={styles.emptyIcon} />
                <p style={styles.emptyText}>No issues found</p>
                <p style={styles.emptySubtext}>Create the first issue for this repository</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue._id} style={styles.issueCard}>
                  <div style={styles.issueLeft}>
                    <div style={styles.statusContainer}>
                      <FaCircle
                        style={{
                          ...styles.statusDot,
                          color: issue.status === "open" ? "#059669" : "#7c3aed",
                        }}
                      />
                      <span style={styles.statusText}>
                        {issue.status === "open" ? "Open" : "Closed"}
                      </span>
                    </div>
                    <div style={styles.issueContent}>
                      <h3 style={styles.issueTitle}>{issue.title}</h3>
                      <p style={styles.issueDesc}>{issue.description}</p>
                      <div style={styles.issueMeta}>
                        <span style={styles.issueDate}>
                          {issue.status === "open" ? "opened" : "closed"} 5d ago
                        </span>
                        <span style={styles.issueNumber}>#{issue.issueNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.issueActions}>
                    <button
                      style={styles.actionButton}
                      onClick={() => navigate(`/issue/update/${issue._id}`)}
                    >
                      <FaPen size={14} />
                      Update
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(issue._id)}
                    >
                      <FaTrashAlt size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0d1117",
    padding: "120px 20px 40px",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#c9d1d9",
  },
  repoName: {
    color: "#58a6ff",
    cursor: "pointer",
    textDecoration: "underline",
    transition: "all 0.3s ease",
  },
  separator: {
    color: "#8b949e",
    fontSize: "14px",
  },
  currentPage: {
    color: "#c9d1d9",
    fontWeight: "700",
  },
  newIssueBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "6px",
    border: "none",
    background: "#58a6ff",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  issuesSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#161b22",
    borderRadius: "6px",
    padding: "32px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    border: "1px solid #30363d",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #30363d",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: 0,
  },
  sectionIcon: {
    color: "#58a6ff",
    fontSize: "20px",
  },
  issueCount: {
    fontSize: "16px",
    color: "#8b949e",
    fontWeight: "500",
  },
  issueList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  issueCard: {
    background: "#21262d",
    borderRadius: "6px",
    padding: "24px",
    border: "1px solid #30363d",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  issueLeft: {
    display: "flex",
    gap: "16px",
    flex: 1,
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
  },
  statusDot: {
    fontSize: "12px",
  },
  statusText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8b949e",
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#58a6ff",
  },
  issueDesc: {
    fontSize: "14px",
    color: "#8b949e",
    margin: "0 0 12px 0",
    lineHeight: "1.5",
  },
  issueMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#8b949e",
  },
  issueDate: {
    fontWeight: "500",
  },
  issueNumber: {
    fontWeight: "600",
  },
  issueActions: {
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#161b22",
    color: "#c9d1d9",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  deleteButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#21262d",
    color: "#f85149",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#8b949e",
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#cbd5e1",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#c9d1d9",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#8b949e",
    margin: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #30363d",
    borderTop: "4px solid #58a6ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#c9d1d9",
    margin: 0,
    fontWeight: "500",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px",
    background: "#161b22",
    borderRadius: "6px",
    margin: "0 auto",
    maxWidth: "400px",
    border: "1px solid #30363d",
  },
  errorIcon: {
    fontSize: "48px",
    color: "#f85149",
    marginBottom: "16px",
  },
  errorText: {
    fontSize: "16px",
    color: "#dc2626",
    margin: 0,
    fontWeight: "600",
    textAlign: "center",
  },
};

export default IssueList;
