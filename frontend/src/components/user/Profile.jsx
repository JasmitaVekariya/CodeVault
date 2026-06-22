import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";
// --- CHANGED IMPORTS ---
import { UnderlineNav } from "@primer/react"; 
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import { FaUser, FaEnvelope, FaCode, FaStar, FaEye, FaCodeBranch, FaSignOutAlt, FaEdit, FaHistory } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";


const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "Username" });
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [togglingIds, setTogglingIds] = useState([]); // repo ids currently toggling
  const { setCurrentUser } = useAuth();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Axios instance
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/userProfile/${userId}`);
        // server may return user object directly or a wrapper:
        setUserDetails(res.data?.user ?? res.data ?? {});
      } catch (err) {
        console.error("Cannot fetch user details:", err);
        setError("Unable to load user details");
      }
    };

    const fetchRepositories = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await api.get(`/repo/user/${userId}`);

        // Accept different shapes: { repositories: [...] } or [...] or { repos: [...] }
        let raw = res.data?.repositories ?? res.data?.repos ?? res.data ?? [];
        if (!Array.isArray(raw)) {
          // sometimes backend returns object keyed by id; convert to array
          raw = Object.values(raw);
        }

        // Normalize each repo: ensure _id and isStarred exist
        const normalized = raw.map((r) => ({
          ...r,
          _id: r._id || r.id,
          isStarred: r.isStarred ?? r.starred ?? false,
        }));

        setRepositories(normalized);
      } catch (err) {
        console.error("Error while fetching repositories:", err);
        setError("Failed to load repositories");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    fetchRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // api/authHeader not included to avoid re-running; base assumptions: token stored beforehand

  // Toggle star (optimistic UI update + revert on failure)
  const toggleStar = async (repoId, currentIsStarred) => {
  try {
    setTogglingIds((prev) => [...prev, repoId]);

    const res = await api.post("/star", { userId, repoId });

    const finalIsStarred = res.data.isStarred;

    setRepositories((prev) =>
      prev.map((repo) =>
        repo._id === repoId ? { ...repo, isStarred: finalIsStarred } : repo
      )
    );
  } catch (err) {
    console.error("Error toggling star:", err);
    setError("Failed to toggle star");
  } finally {
    setTogglingIds((prev) => prev.filter((id) => id !== repoId));
  }
};

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* --- REPLACED NAVBAR JSX --- */}
        <div style={styles.navTabs}>
          <UnderlineNav aria-label="Repository">
            <UnderlineNav.Item
              aria-current="page"
              icon={BookIcon}
              sx={styles.underlineNavItem}
            >
              Overview
            </UnderlineNav.Item>
            <UnderlineNav.Item
              onClick={() => navigate("/profile/starred")}
              icon={RepoIcon}
              sx={styles.underlineNavItem}
            >
              Starred Repositories
            </UnderlineNav.Item>
          </UnderlineNav>
        </div>

        <div style={styles.profileContainer}>
          {/* LEFT SIDEBAR */}
          <div style={styles.sidebar}>
            <div style={styles.profileCard}>
              <div style={styles.profileImage}>
                {/* --- THIS IS THE CHANGED LINE --- */}
                <img
                  src="https://avatars.githubusercontent.com/u/583231?v=4"
                  alt="Profile"
                  style={styles.avatar}
                />
              </div>
              <h2 style={styles.username}>{userDetails.username}</h2>
              <p style={styles.userEmail}>
                <FaEnvelope style={styles.infoIcon} />
                {userDetails.email}
              </p>
              <p style={styles.userBio}>{userDetails.bio || "No bio available"}</p>
              
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <FaCode style={styles.statIcon} />
                  <div>
                    <div style={styles.statNumber}>{repositories.length}</div>
                    <div style={styles.statLabel}>Repositories</div>
                  </div>
                </div>
                <div style={styles.statItem}>
                  <FaStar style={styles.statIcon} />
                  <div>
                    <div style={styles.statNumber}>
                      {repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0)}
                    </div>
                    <div style={styles.statLabel}>Stars</div>
                  </div>
                </div>
              </div>

              <button
                style={styles.editButton}
                onClick={() => navigate(`/user/update/${userId}`)}
              >
                <FaEdit style={{ marginRight: "8px" }} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div style={styles.mainContent}>
            <div style={styles.repositoriesSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Your Repositories</h3>
                <div style={styles.sectionStats}>
                  {repositories.length} repositories
                </div>
              </div>
              
              {loading && (
                <div style={styles.loadingContainer}>
                  <div style={styles.loadingSpinner}></div>
                  <p style={styles.loadingText}>Loading repositories...</p>
                </div>
              )}
              
              {error && (
                <div style={styles.errorContainer}>
                  <p style={styles.errorText}>{error}</p>
                </div>
              )}
              
              <div style={styles.reposGrid}>
                {repositories.length > 0 ? (
                  repositories.map((repo) => (
                    <div
                      style={styles.repoCard}
                      key={repo._id}
                      onClick={() => navigate(`/repository/${repo._id}`)}
                    >
                      <div style={styles.repoHeader}>
                        <h4 style={styles.repoTitle}>{repo.name}</h4>
                        <div style={styles.repoVisibility}>
                          {repo.visibility ? (
                            <FaEye style={styles.visibilityIcon} />
                          ) : (
                            <FaCodeBranch style={styles.visibilityIcon} />
                          )}
                        </div>
                      </div>
                      
                      <p style={styles.repoDescription}>
                        {repo.description || "No description provided"}
                      </p>
                      
                      <div style={styles.repoFooter}>
                        {/* <span style={styles.repoLanguage}>
                          {repo.language || "Unknown"}
                        </span> */}
                        <div style={styles.repoStats}>
                          <span style={styles.repoStat}>
                            <FaStar style={styles.repoStatIcon} />
                            {repo.stars || 0}
                          </span>
                          {/* <span style={styles.repoStat}>
                            <FaCodeBranch style={styles.repoStatIcon} />
                            {repo.forks || 0}
                          </span> */}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !loading && (
                    <div style={styles.emptyState}>
                      <FaCode style={styles.emptyIcon} />
                      <p style={styles.emptyText}>No repositories found</p>
                      <p style={styles.emptySubtext}>Create your first repository to get started</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* HEATMAP */}
            <div style={styles.heatmapSection}>
              <h3 style={styles.sectionTitle}>Contribution Activity</h3>
              <div style={styles.heatmapCard}>
                <HeatMapProfile />
              </div>
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setCurrentUser(null);
            window.location.href = "/auth";
          }}
          style={styles.logoutButton}
        >
          <FaSignOutAlt style={{ marginRight: "8px" }} />
          Logout
        </button>
      </div>
    </>
  );
};

// --- UPDATED STYLES OBJECT ---
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0d1117",
    padding: "120px 20px 40px",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  navTabs: {
    maxWidth: "1200px",
    margin: "0 auto 32px",
    borderBottom: "1px solid #30363d",
    paddingLeft: "20px",
  },
  underlineNavItem: {
    color: "#c9d1d9",
    padding: "10px 0",
    fontWeight: 600,
    fontSize: "1rem",
    borderBottom: "3px solid transparent",
    transition: "color 0.2s ease, border-color 0.2s ease",
    "&:hover": {
       color: "#6a99cfff",
      
    },
    "&[aria-current='page']": {
      color: "#729cccff",
     
      fontWeight: 700,
    },
    "& svg": {
      verticalAlign: "middle",
      marginRight: "6px",
      fill: "currentColor",
      height: "16px",
      width: "16px",
    }
  },
  profileContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "32px",
  },
  sidebar: {
    display:"flex",
    flexDirection: "column",
  },
  profileCard: {
    background: "#161b22",
    borderRadius: "6px",
    padding: "32px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    border: "1px solid #30363d",
    textAlign: "center",
  },
  profileImage: {
    marginBottom: "24px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #30363d",
    boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.2)",
  },
  username: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 12px 0",
    color: "#c9d1d9",
  },
  userEmail: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "16px",
    color: "#8b949e",
    margin: "0 0 16px 0",
    fontWeight: "500",
  },
  userBio: {
    fontSize: "16px",
    color: "#8b949e",
    margin: "0 0 24px 0",
    lineHeight: "1.5",
    fontStyle: "italic",
  },
  infoIcon: {
    color: "#58a6ff",
    fontSize: "14px",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "24px",
    padding: "20px 0",
    borderTop: "1px solid #30363d",
    borderBottom: "1px solid #30363d",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statIcon: {
    color: "#58a6ff",
    fontSize: "20px",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#c9d1d9", // <-- Fixed typo here
  },
  statLabel: {
    fontSize: "14px",
    color: "#8b949e",
    fontWeight: "500",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "6px",
    border: "none",
    background: "#3a4251", 
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  repositoriesSection: {
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
    fontSize: "24px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: 0,
  },
  sectionStats: {
    fontSize: "16px",
    color: "#8b949e",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
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
    color: "#8b949e",
    margin: 0,
  },
  errorContainer: {
    padding: "20px",
    backgroundColor: "#21262d",
    borderRadius: "6px",
    border: "1px solid #30363d",
    textAlign: "center",
  },
  errorText: {
    color: "#f85149",
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
  },
  reposGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  repoCard: {
    background: "#21262d",
    borderRadius: "6px",
    padding: "24px",
    border: "1px solid #30363d",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  repoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  repoTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#58a6ff",
    margin: 0,
  },
  repoVisibility: {
    color: "#8b949e",
  },
  visibilityIcon: {
    fontSize: "16px",
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
  repoLanguage: {
    fontSize: "12px",
    color: "#58a6ff",
    fontWeight: "600",
    padding: "4px 8px",
    backgroundColor: "#21262d",
    borderRadius: "6px",
  },
  repoStats: {
    display: "flex",
    gap: "12px",
  },
  repoStat: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "14px",
    color: "#8b949e",
    fontWeight: "500",
  },
  repoStatIcon: {
    fontSize: "12px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#8b949e",
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#8b949e",
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
  heatmapSection: {
    background: "#161b22",
    borderRadius: "6px",
    padding: "32px",
    boxShadow: "0 6px 14px rgba(0,0,m,0.4)",
    border: "1px solid #30363d",
  },
  heatmapCard: {
    background: "#21262d",
    borderRadius: "6px",
    padding: "20px",
    border: "1px solid #30363d",
  },
  logoutButton: {
    position: "fixed",
    bottom: "32px",
    right: "32px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#3a4251", 
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(53, 62, 76, 0.7)", 
  },
};

export default Profile;