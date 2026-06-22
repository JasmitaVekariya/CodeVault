import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaUsers, FaUser, FaCode, FaEye, FaSpinner } from "react-icons/fa";

const Connections = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users from the database using the correct endpoint
      const response = await fetch("http://localhost:3000/allUser");
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const users = await response.json();
      
      // Filter out the current user from the list
      const currentUserId = localStorage.getItem("userId");
      const otherUsers = users.filter(user => user._id !== currentUserId);
      setUsers(otherUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <div style={styles.iconContainer}>
                <FaUsers size={32} />
              </div>
              <div>
                <h1 style={styles.title}>Developer Profiles</h1>
                <p style={styles.subtitle}>Explore other developers and their repositories</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <FaSpinner style={styles.loadingSpinner} />
              <p style={styles.loadingText}>Loading developer profiles...</p>
            </div>
          ) : (
            <div style={styles.usersGrid}>
              {users.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaUsers style={styles.emptyIcon} />
                  <h3 style={styles.emptyTitle}>No developer profiles found</h3>
                  <p style={styles.emptyText}>
                    No other developers available at the moment
                  </p>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    style={styles.userCard}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div style={styles.userAvatar}>
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <FaUser style={styles.avatarIcon} />
                      )}
                    </div>
                    
                    <div style={styles.userInfo}>
                      <h3 style={styles.username}>{user.username || "Unknown User"}</h3>
                      <p style={styles.userEmail}>{user.email}</p>
                      {user.bio && (
                        <p style={styles.userBio}>{user.bio}</p>
                      )}
                    </div>

                    <div style={styles.userStats}>
                      <div style={styles.statItem}>
                        <FaCode style={styles.statIcon} />
                        <span style={styles.statText}>Repos</span>
                      </div>
                      <div style={styles.statItem}>
                        <FaEye style={styles.statIcon} />
                        <span style={styles.statText}>View Profile</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
  header: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
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
    boxShadow: "0 10px 25px -5px rgba(88, 166, 255, 0.4)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#c9d1d9",
  },
  subtitle: {
    fontSize: "18px",
    color: "#8b949e",
    margin: 0,
    fontWeight: "500",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  usersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  userCard: {
    background: "#161b22",
    borderRadius: "6px",
    padding: "24px",
    border: "1px solid #30363d",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  userAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#21262d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    border: "2px solid #30363d",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarIcon: {
    fontSize: "24px",
    color: "#8b949e",
  },
  userInfo: {
    marginBottom: "16px",
  },
  username: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: "0 0 8px 0",
  },
  userEmail: {
    fontSize: "14px",
    color: "#8b949e",
    margin: "0 0 8px 0",
  },
  userBio: {
    fontSize: "14px",
    color: "#8b949e",
    margin: 0,
    lineHeight: "1.5",
  },
  userStats: {
    display: "flex",
    gap: "16px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    color: "#8b949e",
  },
  statIcon: {
    fontSize: "12px",
    color: "#58a6ff",
  },
  statText: {
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px",
  },
  loadingSpinner: {
    fontSize: "32px",
    color: "#58a6ff",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#8b949e",
    margin: 0,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    gridColumn: "1 / -1",
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#8b949e",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#c9d1d9",
    margin: "0 0 8px 0",
  },
  emptyText: {
    fontSize: "16px",
    color: "#8b949e",
    margin: 0,
  },
};

export default Connections;
