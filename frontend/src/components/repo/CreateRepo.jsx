import React, { useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { FaFolderPlus, FaCode, FaGlobe, FaLock, FaInfoCircle } from "react-icons/fa";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleVisibilityChange = (value) => {
    setVisibility(value === "true");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const owner = localStorage.getItem("userId");
      const response = await axios.post("http://localhost:3000/repo/create", {
        owner,
        name,
        description,
        content,
        visibility,
      });

      setMessage(response.data.message);
      if (response.status === 200) {
        // Get the repository ID from the response to redirect to repo details
        const repoId = response.data.repositoryID || response.data.repoId || response.data.repository?._id;
        if (repoId) {
          setTimeout(() => {
            navigate(`/repository/${repoId}`);
          }, 1200);
        } else {
          // Fallback to dashboard if no repo ID
          setTimeout(() => {
            navigate("/dashboard");
          }, 1200);
        }
      }
    } catch (error) {
      console.error("Error creating repository:", error);
      if (error.response?.data?.message) {
        setMessage(`❌ ${error.response.data.message}`);
      } else {
        setMessage("❌ Failed to create repository.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <FaFolderPlus size={32} />
            </div>
            <h1 style={styles.title}>Create New Repository</h1>
            <p style={styles.subtitle}>Set up a new repository to start collaborating</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* General Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionNumber}>1</div>
                <h3 style={styles.sectionTitle}>General Information</h3>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaCode style={styles.labelIcon} />
                  Repository Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="Enter repository name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaInfoCircle style={styles.labelIcon} />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  style={styles.textarea}
                  placeholder="Describe what this repository is about"
                />
              </div>
            </div>

            {/* Content Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionNumber}>2</div>
                <h3 style={styles.sectionTitle}>Initial Content</h3>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaCode style={styles.labelIcon} />
                  Initial Content
                </label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={styles.input}
                  placeholder="Optional: Add initial content or README"
                />
              </div>
            </div>

            {/* Configuration Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionNumber}>3</div>
                <h3 style={styles.sectionTitle}>Visibility Settings</h3>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {visibility ? <FaGlobe style={styles.labelIcon} /> : <FaLock style={styles.labelIcon} />}
                  Repository Visibility *
                </label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioOption}>
                    <input
                      type="radio"
                      value="true"
                      checked={visibility === true}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      style={styles.radio}
                    />
                    <div style={styles.radioContent}>
                      <FaGlobe style={styles.radioIcon} />
                      <div>
                        <div style={styles.radioTitle}>Public</div>
                        <div style={styles.radioDescription}>Anyone can see this repository</div>
                      </div>
                    </div>
                  </label>
                  
                  <label style={styles.radioOption}>
                    <input
                      type="radio"
                      value="false"
                      checked={visibility === false}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      style={styles.radio}
                    />
                    <div style={styles.radioContent}>
                      <FaLock style={styles.radioIcon} />
                      <div>
                        <div style={styles.radioTitle}>Private</div>
                        <div style={styles.radioDescription}>Only you can see this repository</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              <FaFolderPlus style={{ marginRight: "8px" }} />
              Create Repository
            </button>
          </form>

          {message && (
            <div style={message.includes("Failed") ? styles.errorMessage : styles.successMessage}>
              {message}
            </div>
          )}
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
    gap: "32px",
  },
  section: {
    background: "#21262d",
    borderRadius: "6px",
    padding: "24px",
    border: "1px solid #30363d",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #30363d",
  },
  sectionNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    background: "#58a6ff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: 0,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
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
    backgroundColor: "#0d1117",
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
    backgroundColor: "#0d1117",
    color: "#c9d1d9",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  radioOption: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#0d1117",
  },
  radio: {
    margin: 0,
    accentColor: "#58a6ff",
  },
  radioContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  radioIcon: {
    color: "#58a6ff",
    fontSize: "20px",
  },
  radioTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#c9d1d9",
    marginBottom: "4px",
  },
  radioDescription: {
    fontSize: "14px",
    color: "#8b949e",
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
  },
};

export default CreateRepo;
