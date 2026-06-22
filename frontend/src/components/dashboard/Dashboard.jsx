import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiStar, FiEye, FiCode, FiCalendar, FiTrendingUp } from "react-icons/fi";
import Navbar from "../Navbar";

const palette = {
  bg: "#0d1117",
  card: "#161b22",
  border: "#30363d",
  accent: "#58a6ff",
  textPrimary: "#c9d1d9",
  textSecondary: "#8b949e",
  gradient: "linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%)",
};

const styles = {
  appWrapper: {
    background: palette.bg,
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    padding: 0,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: palette.textPrimary,
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr 1fr",
    gap: "32px",
    padding: "120px 24px 80px",
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  sidebar: {
    background: palette.card,
    border: `1px solid ${palette.border}`,
    borderRadius: "6px",
    padding: "32px 24px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  card: {
    background: "#21262d",
    borderRadius: "6px",
    padding: "24px 20px",
    marginBottom: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #30363d",
  },
  cardHover: {
    background: "#30363d",
    boxShadow: "0 8px 25px -5px rgba(88, 166, 255, 0.3)",
    transform: "translateY(-2px)",
  },
  cardTitle: {
    margin: 0,
    color: palette.accent,
    fontSize: "1.1rem",
    fontWeight: "700",
  },
  cardDesc: {
    margin: "8px 0 0",
    color: palette.textSecondary,
    fontSize: "0.9rem",
    lineHeight: "1.5",
    minHeight: "40px",
  },
  ownerText: {
    fontSize: "0.8rem",
    color: palette.textSecondary,
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
  },
  heading: {
    borderBottom: `1px solid ${palette.border}`,
    paddingBottom: "16px",
    marginBottom: "24px",
    fontSize: "1.5rem",
    fontWeight: "800",
    color: palette.accent,
  },
  searchWrapper: {
    position: "relative",
    marginBottom: "24px",
  },
  searchBox: {
    width: "100%",
    padding: "16px 20px 16px 48px",
    borderRadius: "6px",
    border: `1px solid ${palette.border}`,
    background: "#21262d",
    color: palette.textPrimary,
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s ease",
    fontWeight: "500",
  },
  searchIcon: {
    position: "absolute",
    top: "50%",
    left: "16px",
    transform: "translateY(-50%)",
    color: palette.accent,
    fontSize: "18px",
  },
  noResults: {
    textAlign: "center",
    color: palette.textSecondary,
    padding: "32px 20px",
    fontSize: "16px",
    fontWeight: "500",
  },
  searchInfo: {
    color: palette.textSecondary,
    fontSize: "14px",
    fontWeight: "500",
    margin: "8px 0 16px 0",
    padding: "8px 12px",
    backgroundColor: "#21262d",
    borderRadius: "4px",
    border: "1px solid #30363d",
  },
  loading: {
    textAlign: "center",
    padding: "60px 40px",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: palette.textPrimary,
  },
  error: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#f85149",
    fontSize: "1.3rem",
    fontWeight: "600",
    backgroundColor: "#21262d",
    borderRadius: "6px",
    border: "1px solid #30363d",
  },
  statsCard: {
    background: "#21262d",
    borderRadius: "6px",
    padding: "20px",
    marginBottom: "16px",
    border: "1px solid #30363d",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statsIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    background: palette.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  statsText: {
    fontSize: "14px",
    fontWeight: "600",
    color: palette.textPrimary,
  },
};

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    // Fetch user's own repos
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/repo/user/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setRepositories(data.repositories ?? data ?? []);
      } catch (err) {
        setError("Failed to load repositories");
      } finally {
        setLoading(false);
      }
    };

    // Fetch suggested repos
    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/all`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const filteredRepos = (data ?? []).filter((repo) => {
          const ownerId = repo.ownerId || (repo.owner && repo.owner._id);
          return (
            ownerId &&
            String(ownerId) !== String(userId) &&
            repo.visibility === true
          );
        });

        setSuggestedRepositories(filteredRepos);
      } catch (err) {
        setError("Failed to load suggested repositories");
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  // Filter repos: show last 3-4 repos by default, or all matching repos when searching
  const filteredUserRepos =
    searchQuery.length > 0
      ? repositories.filter((repo) =>
          repo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : repositories.slice(-4); // Show last 4 repositories (most recent)

  if (loading) {
    return (
      <div style={styles.appWrapper}>
        <div style={styles.loading}>
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.appWrapper}>
        <div style={styles.error}>
          <h2>Error: {error}</h2>
        </div>
      </div>
    );
  }

  // Hover helpers
  const handleMouseEnter = (e) => {
    e.currentTarget.style.background = styles.cardHover.background;
    e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = palette.card;
    e.currentTarget.style.boxShadow = styles.card.boxShadow;
  };

  return (
    <>
      <Navbar />
      <div style={styles.appWrapper}>
        <section id="dashboard" style={styles.dashboard}>
          {/* Stats & Quick Actions */}
          <aside style={styles.sidebar}>
            <h3 style={styles.heading}>📊 Quick Stats</h3>
            <div style={styles.statsCard}>
              <div style={styles.statsIcon}>
                <FiCode size={20} />
              </div>
              <div>
                <div style={styles.statsText}>Your Repositories</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: palette.accent }}>
                  {repositories.length}
                </div>
              </div>
            </div>
            <div style={styles.statsCard}>
              <div style={styles.statsIcon}>
                <FiStar size={20} />
              </div>
              <div>
                <div style={styles.statsText}>Total Stars</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: palette.accent }}>
                  {repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0)}
                </div>
              </div>
            </div>
            <div style={styles.statsCard}>
              <div style={styles.statsIcon}>
                <FiEye size={20} />
              </div>
              <div>
                <div style={styles.statsText}>Total Views</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: palette.accent }}>
                  {repositories.reduce((sum, repo) => sum + (repo.views || 0), 0)}
                </div>
              </div>
            </div>
          </aside>

          {/* User Repositories with Search */}
          <main style={styles.sidebar}>
            <h2 style={styles.heading}>🚀 Your Repositories</h2>
            <div style={styles.searchWrapper}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                placeholder="Search all your repositories..."
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchBox}
                onFocus={(e) => (e.target.style.borderColor = palette.accent)}
                onBlur={(e) => (e.target.style.borderColor = palette.border)}
              />
            </div>
            {searchQuery.length > 0 && (
              <p style={styles.searchInfo}>
                Showing {filteredUserRepos.length} matching repositories
              </p>
            )}
            {searchQuery.length === 0 && repositories.length > 4 }
            {filteredUserRepos.length > 0 ? (
              filteredUserRepos.map((repo) => (
                <div
                  style={styles.card}
                  key={repo._id}
                  onClick={() => navigate(`/repository/${repo._id}`)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <h4 style={styles.cardTitle}>{repo?.name}</h4>
                  <p style={styles.cardDesc}>
                    {repo?.description || "No description provided"}
                  </p>
                  <p style={styles.ownerText}>
                    <FiUser /> {repo?.owner?.username || "You"}
                  </p>
                </div>
              ))
            ) : searchQuery.length > 0 ? (
              <p style={styles.noResults}>No repositories found matching your search.</p>
            ) : repositories.length === 0 ? (
              <p style={styles.noResults}>You haven't created any repositories yet.</p>
            ) : null}
          </main>

          {/* Suggested Repositories & Events */}
          <aside style={styles.sidebar}>
            <h3 style={styles.heading}>🌟 Discover</h3>
            {suggestedRepositories.length > 0 ? (
              suggestedRepositories.slice(0, 3).map((repo) => (
                <div
                  style={styles.card}
                  key={repo._id}
                  onClick={() => navigate(`/repository/${repo._id}`)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <h4 style={styles.cardTitle}>{repo?.name}</h4>
                  <p style={styles.cardDesc}>
                    {repo?.description || "No description provided"}
                  </p>
                  <p style={styles.ownerText}>
                    <FiUser /> {repo?.owner?.username || "Unknown"}
                  </p>
                </div>
              ))
            ) : (
              <p style={styles.noResults}>No suggestions available.</p>
            )}
            
            <h3 style={{...styles.heading, marginTop: "32px"}}>📅 Recent Activity</h3>
            <div
              style={styles.card}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <h4 style={styles.cardTitle}>Welcome to CodeVault!</h4>
              <p style={styles.cardDesc}>
                Start by creating your first repository or exploring public ones.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
