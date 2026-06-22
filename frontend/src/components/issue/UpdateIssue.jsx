import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaBug, FaFileAlt, FaExclamationCircle, FaCheckCircle, FaTimes, FaSpinner } from "react-icons/fa";

const UpdateIssue = () => {
  const { id } = useParams(); // issue ID
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch current issue data
  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/issue/${id}`);
        if (!res.ok) throw new Error("Failed to fetch issue data");
        const data = await res.json();
        setTitle(data.issue.title || "");
        setDescription(data.issue.description || "");
        setStatus(data.issue.status || "open");
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!title.trim() || !description.trim()) {
      setSubmitError("Title and description are required.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/issue/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update issue");
      }

      navigate(-1); // go back
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading issue data...</p>
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
          <p style={styles.errorText}>Error: {error}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <FaBug size={32} />
            </div>
            <h1 style={styles.title}>Update Issue</h1>
            <p style={styles.subtitle}>Modify the issue details and status</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaFileAlt style={styles.labelIcon} />
                Issue Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                placeholder="Enter issue title"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaExclamationCircle style={styles.labelIcon} />
                Description
              </label>
              <textarea
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                placeholder="Describe the issue in detail"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaCheckCircle style={styles.labelIcon} />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={styles.select}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {submitError && (
              <div style={styles.errorMessage}>
                <FaExclamationCircle />
                {submitError}
              </div>
            )}

            <div style={styles.buttonContainer}>
              <button
                type="submit"
                disabled={submitLoading}
                style={submitLoading ? styles.submitButtonDisabled : styles.submitButton}
              >
                {submitLoading ? (
                  <>
                    <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaBug style={{ marginRight: "8px" }} />
                    Update Issue
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                style={styles.cancelButton}
              >
                <FaTimes style={{ marginRight: "8px" }} />
                Cancel
              </button>
            </div>
          </form>
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
  card: {
    maxWidth: "800px",
    margin: "0 auto",
    background: "#161b22",
    borderRadius: "6px",
    padding: "40px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    border: "1px solid #30363d",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  iconContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "6px",
    background: "#58a6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    margin: "0 auto 24px",
    boxShadow: "0 10px 25px -5px rgba(88, 166, 255, 0.4)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 12px 0",
    color: "#c9d1d9",
  },
  subtitle: {
    fontSize: "18px",
    color: "#8b949e",
    margin: 0,
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#c9d1d9",
  },
  labelIcon: {
    color: "#58a6ff",
    fontSize: "16px",
  },
  input: {
    padding: "16px 20px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backgroundColor: "#21262d",
    color: "#c9d1d9",
    outline: "none",
  },
  textarea: {
    padding: "16px 20px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backgroundColor: "#21262d",
    color: "#c9d1d9",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  select: {
    padding: "16px 20px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backgroundColor: "#21262d",
    color: "#c9d1d9",
    outline: "none",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
    marginTop: "20px",
  },
  submitButton: {
    flex: 1,
    padding: "16px 24px",
    borderRadius: "6px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#58a6ff",
    color: "white",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  submitButtonDisabled: {
    flex: 1,
    padding: "16px 24px",
    borderRadius: "6px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
    transition: "all 0.3s ease",
    background: "#8b949e",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  cancelButton: {
    padding: "16px 24px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#21262d",
    color: "#8b949e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  errorMessage: {
    padding: "16px 20px",
    borderRadius: "6px",
    backgroundColor: "#21262d",
    color: "#f85149",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    margin: "0 auto",
    maxWidth: "400px",
  },
  errorIcon: {
    fontSize: "48px",
    color: "#dc2626",
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

export default UpdateIssue;
