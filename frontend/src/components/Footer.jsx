import React from "react";
import { FaCode } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContainer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <div style={styles.logoSection}>
              <div style={styles.logo}>
                <div style={styles.logoIcon}>
                  <FaCode size={20} />
                </div>
                <h3 style={styles.logoText}>CodeVault</h3>
              </div>
              <p style={styles.logoDescription}>
                A modern Git-like version control system for developers.
              </p>
            </div>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.sectionTitle}>Explore</h4>
            <ul style={styles.linkList}>
              <li><a href="/" style={styles.footerLink}>Dashboard</a></li>
              <li><a href="/connections" style={styles.footerLink}>Profiles</a></li>
              <li><a href="/repository/create" style={styles.footerLink}>Create Repository</a></li>
            </ul>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.sectionTitle}>Support</h4>
            <ul style={styles.linkList}>
              <li><a href="/support" style={styles.footerLink}>Documentation</a></li>
              <li><a href="/support" style={styles.footerLink}>Help Center</a></li>
              <li><a href="/contact" style={styles.footerLink}>Contact Us</a></li>
            </ul>
          </div>

          {/* Connect section intentionally removed */}
        </div>

        <div style={styles.footerBottom}>
          <div style={styles.footerBottomContentCentered}>
            <p style={styles.copyrightCentered}>
              © 2025 CodeVault. Made with ❤️ for developers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: "#161b22",
    borderTop: "1px solid #30363d",
    marginTop: "auto",
    padding: "0",
  },
  footerContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "32px",
    padding: "48px 0 32px",
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },
  logoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    background: "#58a6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    margin: 0,
    color: "#c9d1d9",
  },
  logoDescription: {
    fontSize: "14px",
    color: "#8b949e",
    margin: 0,
    lineHeight: "1.5",
    maxWidth: "280px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#c9d1d9",
    margin: "0 0 16px 0",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  footerLink: {
    color: "#8b949e",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  footerBottom: {
    borderTop: "1px solid #30363d",
    padding: "24px 0",
  },
  footerBottomContentCentered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  copyrightCentered: {
    fontSize: "14px",
    color: "#8b949e",
    margin: 0,
    textAlign: "center",
  },
};

export default Footer;
