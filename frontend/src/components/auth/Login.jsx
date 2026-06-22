import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Link } from "react-router-dom";
import { FaCode, FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Login Failed!");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <FaCode size={32} />
            </div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to your CodeVault account</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaEnvelope style={styles.labelIcon} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaLock style={styles.labelIcon} />
                Password
              </label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? styles.submitButtonDisabled : styles.submitButton}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              New to CodeVault?{" "}
              <Link to="/signup" style={styles.link}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d1117",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "20px",
  },
  background: {
    width: "100%",
    maxWidth: "400px",
  },
  card: {
    background: "#161b22",
    borderRadius: "6px",
    padding: "40px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    border: "1px solid #30363d",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    width: "60px",
    height: "60px",
    borderRadius: "6px",
    background: "#58a6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    margin: "0 auto 20px",
    boxShadow: "0 8px 25px -5px rgba(88, 166, 255, 0.4)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#c9d1d9",
  },
  subtitle: {
    fontSize: "16px",
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
    fontSize: "14px",
    fontWeight: "600",
    color: "#c9d1d9",
  },
  labelIcon: {
    color: "#58a6ff",
    fontSize: "14px",
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    padding: "16px 50px 16px 20px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backgroundColor: "#21262d",
    color: "#c9d1d9",
    outline: "none",
    width: "100%",
  },
  eyeButton: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#8b949e",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  },
  submitButton: {
    padding: "16px 24px",
    borderRadius: "6px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#58a6ff",
    color: "white",
    boxShadow: "0 10px 25px -5px rgba(88, 166, 255, 0.4)",
  },
  submitButtonDisabled: {
    padding: "16px 24px",
    borderRadius: "6px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "not-allowed",
    background: "#8b949e",
    color: "white",
    opacity: 0.6,
  },
  footer: {
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #30363d",
  },
  footerText: {
    fontSize: "14px",
    color: "#8b949e",
    margin: 0,
  },
  link: {
    color: "#58a6ff",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s ease",
  },
};

export default Login;