import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaUser, FaCode, FaEye, FaStar, FaArrowLeft, FaSpinner } from "react-icons/fa";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserRepositories();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/userProfile/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");
      
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRepositories = async () => {
    try {
      setReposLoading(true);
      // Use the public repositories endpoint to only show public repos to other users
      const response = await fetch(`http://localhost:3000/repo/user/${userId}/public`);
      if (!response.ok) throw new Error("Failed to fetch repositories");
      
      const data = await response.json();
      setRepositories(data.repositories || data.repos || data || []);
    } catch (err) {
      console.error("Error fetching repositories:", err);
    } finally {
      setReposLoading(false);
    }
  };

  const handleRepoClick = (repoId) => {
    navigate(`/repository/${repoId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <FaSpinner style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Loading user profile...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>User not found</h2>
          <p style={styles.errorText}>The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/connections")}
            style={styles.backButton}
          >
            <FaArrowLeft style={{ marginRight: "8px" }} />
            Back to Connections
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={() => navigate("/connections")}
            style={styles.backButton}
          >
            <FaArrowLeft style={{ marginRight: "8px" }} />
            Back to Connections
          </button>
        </div>

        <div style={styles.profileSection}>
          <div style={styles.profileCard}>
            <div style={styles.profileHeader}>
              <div style={styles.avatarContainer}>
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    style={styles.avatar}
                  />
                ) : (
                  <FaUser style={styles.avatarIcon} />
                )}
              </div>
              <div style={styles.profileInfo}>
                <h1 style={styles.username}>{user.username || "Unknown User"}</h1>
                <p style={styles.userEmail}>{user.email}</p>
                {user.bio && (
                  <p style={styles.userBio}>{user.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.repositoriesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <FaCode style={styles.sectionIcon} />
              Public Repositories ({repositories.length})
            </h2>
          </div>

          {reposLoading ? (
            <div style={styles.loadingContainer}>
              <FaSpinner style={styles.loadingSpinner} />
              <p style={styles.loadingText}>Loading repositories...</p>
            </div>
          ) : repositories.length === 0 ? (
            <div style={styles.emptyState}>
              <FaCode style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>No public repositories</h3>
              <p style={styles.emptyText}>This user hasn't created any public repositories yet.</p>
            </div>
          ) : (
            <div style={styles.reposGrid}>
              {repositories.map((repo) => (
                <div
                  key={repo._id}
                  style={styles.repoCard}
                  onClick={() => handleRepoClick(repo._id)}
                >
                  <div style={styles.repoHeader}>
                    <h3 style={styles.repoName}>{repo.name}</h3>
                    <div style={styles.repoVisibility}>
                      {repo.visibility === false ? (
                        <span style={styles.privateBadge}>Private</span>
                      ) : (
                        <span style={styles.publicBadge}>Public</span>
                      )}
                    </div>
                  </div>
                  
                  {repo.description && (
                    <p style={styles.repoDescription}>{repo.description}</p>
                  )}
                  
                  <div style={styles.repoFooter}>
                    <div style={styles.repoStats}>
                      <div style={styles.statItem}>
                        <FaStar style={styles.statIcon} />
                        <span style={styles.statText}>Stars</span>
                      </div>
                      <div style={styles.statItem}>
                        <FaEye style={styles.statIcon} />
                        <span style={styles.statText}>Views</span>
                      </div>
                    </div>
                    <div style={styles.repoLanguage}>
                      {repo.language || "No language"}
                    </div>
                  </div>
                </div>
              ))}
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
    margin: "0 auto 32px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#161b22",
    color: "#c9d1d9",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  profileSection: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
  },
  profileCard: {
    background: "#161b22",
    borderRadius: "6px",
    padding: "32px",
    border: "1px solid #30363d",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  avatarContainer: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#21262d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #30363d",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarIcon: {
    fontSize: "48px",
    color: "#8b949e",
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#c9d1d9",
    margin: "0 0 8px 0",
  },
  userEmail: {
    fontSize: "18px",
    color: "#8b949e",
    margin: "0 0 12px 0",
  },
  userBio: {
    fontSize: "16px",
    color: "#8b949e",
    margin: 0,
    lineHeight: "1.5",
  },
  repositoriesSection: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionHeader: {
    marginBottom: "24px",
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
  reposGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  repoCard: {
    background: "#161b22",
    borderRadius: "6px",
    padding: "24px",
    border: "1px solid #30363d",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  repoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  repoName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#58a6ff",
    margin: 0,
  },
  repoVisibility: {
    fontSize: "12px",
  },
  privateBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    background: "#f85149",
    color: "white",
    fontWeight: "600",
  },
  publicBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    background: "#3fb950",
    color: "white",
    fontWeight: "600",
  },
  repoDescription: {
    fontSize: "14px",
    color: "#8b949e",
    margin: "0 0 16px 0",
    lineHeight: "1.5",
  },
  repoFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  repoStats: {
    display: "flex",
    gap: "16px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
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
  repoLanguage: {
    fontSize: "12px",
    color: "#8b949e",
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
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: "0 0 12px 0",
  },
  errorText: {
    fontSize: "16px",
    color: "#8b949e",
    margin: "0 0 24px 0",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
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

export default UserProfile;
