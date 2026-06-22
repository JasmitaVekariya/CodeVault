import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaUser, FaImage, FaEdit, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const UpdateProfile = () => {
  const { id } = useParams(); // userId from route params
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  // Profile picture is managed by the backend default; no editing here
  const [message, setMessage] = useState("");

  // Load existing user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/userProfile/${id}`);
        setUsername(res.data.username || "");
        setBio(res.data.bio || "");
        // profilePicture handled by backend default; no local state needed
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.put(`http://localhost:3000/updateuser/${id}`, {
      username,
      bio,
    });

    setMessage("Profile updated successfully ✅");
    navigate("/profile");
  } catch (err) {
    console.error("Error updating user:", err);
    setMessage("Failed to update profile ❌");
  }
};


  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <FaEdit size={32} />
            </div>
            <h1 style={styles.title}>Update Profile</h1>
            <p style={styles.subtitle}>Edit your personal information and profile picture</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaUser style={styles.labelIcon} />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Enter your username"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaUser style={styles.labelIcon} />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={styles.textarea}
                placeholder="Write something about yourself..."
                rows="4"
              />
            </div>

            {/* Profile image update removed as requested */}

            {/* Profile image preview removed */}

            <button type="submit" style={styles.submitButton}>
              <FaEdit style={{ marginRight: "8px" }} />
              Update Profile
            </button>
          </form>

          {message && (
            <div style={message.includes("Failed") ? styles.errorMessage : styles.successMessage}>
              {message.includes("Failed") ? (
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

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0d1117",
    padding: "120px 20px 40px",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: "600px",
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
  previewContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#21262d",
    borderRadius: "6px",
    border: "1px solid #30363d",
  },
  previewLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#8b949e",
  },
  previewImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #30363d",
    boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.2)",
  },
  imageError: {
    fontSize: "14px",
    color: "#f85149",
    fontWeight: "500",
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

export default UpdateProfile;
