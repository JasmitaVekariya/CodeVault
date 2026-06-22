import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaCog, FaCode, FaInfoCircle, FaGlobe, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

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
    minHeight: "120px",
    fontFamily: "inherit",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#21262d",
    borderRadius: "6px",
    border: "1px solid #30363d",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    accentColor: "#58a6ff",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#c9d1d9",
    cursor: "pointer",
  },
  submitButton: {
    padding: "20px 32px",
    borderRadius: "6px",
    border: "none",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#58a6ff",
    color: "white",
    boxShadow: "0 10px 25px -5px rgba(88, 166, 255, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
  },
  successMessage: {
    padding: "16px 20px",
    borderRadius: "6px",
    backgroundColor: "#21262d",
    color: "#3fb950",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  errorMessage: {
    padding: "16px 20px",
    borderRadius: "12px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    border: "4px solid rgba(255, 255, 255, 0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "16px",
    color: "white",
    margin: 0,
    fontWeight: "500",
  },
};

const UpdateRepository = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repo, setRepo] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(""); // single new content entry
  const [visibility, setVisibility] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch current repository data
  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch repository");
        }
        const data = await response.json();
        setRepo(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setVisibility(data.visibility ?? true);
      } catch (err) {
        console.error(err);
        setError("Failed to load repository data.");
      }
    };

    fetchRepo();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:3000/repo/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, content, visibility }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update repository");
      }

      setMessage("✅ Repository updated successfully!");

      // Redirect to detail page after short delay
      setTimeout(() => {
        navigate(`/repository/${id}`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("❌ Error updating repository.");
    }
  };

  if (!repo) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading repository...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <FaCog size={32} />
            </div>
            <h1 style={styles.title}>Update Repository</h1>
            <p style={styles.subtitle}>Modify your repository settings and information</p>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <FaExclamationCircle />
              {error}
            </div>
          )}
          {message && (
            <div style={styles.successMessage}>
              <FaCheckCircle />
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaCode style={styles.labelIcon} />
                Repository Name
              </label>
              <input
                type="text"
                placeholder="Enter repository name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaInfoCircle style={styles.labelIcon} />
                Description
              </label>
              <textarea
                placeholder="Describe what this repository is about"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaCode style={styles.labelIcon} />
                Add Content
              </label>
              <input
                type="text"
                placeholder="Add new content or files"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={visibility}
                onChange={(e) => setVisibility(e.target.checked)}
                style={styles.checkbox}
                id="visibility"
              />
              <label style={styles.checkboxLabel} htmlFor="visibility">
                {visibility ? <FaGlobe style={styles.labelIcon} /> : <FaLock style={styles.labelIcon} />}
                Public Repository
              </label>
            </div>

            <button type="submit" style={styles.submitButton}>
              <FaCog style={{ marginRight: "8px" }} />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateRepository;
