import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaBug, FaFileAlt, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

const CreateIssue = ({ repositoryId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
      borderRadius: "6px",
      backgroundColor: "#21262d",
      color: "#f85149",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage("Title and description are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/issue/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, id: repositoryId }),
      });

      if (!response.ok) {
        const data = await response.text();
        setMessage(data || "Failed to create issue");
        return;
      }

      const data = await response.json();
      setMessage("Issue created successfully!");

      setTimeout(() => navigate(`/repository/${repositoryId}`), 1000);
    } catch (err) {
      setMessage("Error connecting to server.");
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <FaBug size={32} />
            </div>
            <h1 style={styles.title}>Create New Issue</h1>
            <p style={styles.subtitle}>Report a bug or request a feature for this repository</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaFileAlt style={styles.labelIcon} />
                Issue Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                required
                placeholder="Enter a clear and descriptive title"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaExclamationCircle style={styles.labelIcon} />
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                required
                placeholder="Provide detailed information about the issue, including steps to reproduce if applicable"
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              <FaBug style={{ marginRight: "8px" }} />
              Create Issue
            </button>
          </form>

          {message && (
            <div style={message.includes("Failed") || message.includes("Error") ? styles.errorMessage : styles.successMessage}>
              {message.includes("Failed") || message.includes("Error") ? (
                <FaExclamationCircle />
              ) : (
                <FaCheckCircle />
              )}
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateIssue;
