import React from "react";
import { Link } from "react-router-dom";
import { FaCode, FaUser, FaPlus, FaUsers } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <FaCode size={24} />
            </div>
            <h3 style={styles.logoText}>CodeVault</h3>
          </div>
        </Link>
        
        <div style={styles.navLinks}>
          <Link to="/repository/create" style={styles.navLink}>
            <FaPlus size={16} style={styles.navIcon} />
            <span>New Repository</span>
          </Link>
          <Link to="/connections" style={styles.navLink}>
            <FaUsers size={16} style={styles.navIcon} />
            <span>Profiles</span>
          </Link>
          <Link to="/profile" style={styles.navLink}>
            <FaUser size={16} style={styles.navIcon} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "70px",
  },
  logoLink: {
    textDecoration: "none",
    color: "inherit",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    background: "#58a6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 6px -1px rgba(88, 166, 255, 0.3)",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "800",
    margin: 0,
    color: "#c9d1d9",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    textDecoration: "none",
    color: "#c9d1d9",
    fontWeight: "600",
    fontSize: "15px",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    backgroundColor: "transparent",
    border: "1px solid transparent",
  },
  navIcon: {
    color: "#58a6ff",
  },
};

export default Navbar;
