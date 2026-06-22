import React from "react";
import Navbar from "./Navbar";

const Support = () => {
  return (
    <>
      <Navbar />
      <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Support & Documentation</h1>
        <p style={styles.subtitle}>Learn about this project and how to use it.</p>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>About the Project</h2>
          <p style={styles.text}>
            This is a GitHub-like clone featuring repositories, commits, issues, user profiles,
            and S3-backed storage. It includes a dark theme, commit history with ZIP downloads,
            public/private repositories, and ownership-based access control.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <ul style={styles.list}>
            <li>Commit history sorted by time (latest first)</li>
            <li>Download any commit as a ZIP</li>
            <li>Public/private repositories with owner-only write access</li>
            <li>Developer profiles and public repo viewing</li>
            <li>Issues management</li>
            <li>Modern black theme UI</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Help Center</h2>
          <ol style={styles.list}>
            <li>To create a repository, go to Repository → Create.</li>
            <li>Upload files and commit them. Push to sync with S3.</li>
            <li>Visit repository details to view commit history and downloads.</li>
            <li>Manage profile from Profile → Edit.</li>
          </ol>
        </section>
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
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#161b22",
    borderRadius: "6px",
    padding: "32px",
    border: "1px solid #30363d",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    color: "#c9d1d9",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    margin: 0,
  },
  subtitle: {
    color: "#8b949e",
    marginTop: "8px",
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 8px 0",
  },
  text: {
    color: "#8b949e",
    lineHeight: 1.7,
  },
  list: {
    color: "#8b949e",
    lineHeight: 1.8,
    paddingLeft: "18px",
  },
};

export default Support;


