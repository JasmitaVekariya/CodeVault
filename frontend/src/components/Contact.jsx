import React, { useState } from "react";
import Navbar from "./Navbar";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>We usually respond within 1-2 business days.</p>

        {submitted ? (
          <div style={styles.success}>Thanks! We'll get back to you soon.</div>
        ) : (
          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.group}>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Message</label>
              <textarea style={styles.textarea} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <button style={styles.button} type="submit">Send</button>
          </form>
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
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: "700px",
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
  form: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#c9d1d9",
    fontWeight: 600,
  },
  input: {
    padding: "14px 16px",
    background: "#21262d",
    border: "1px solid #30363d",
    borderRadius: "6px",
    color: "#c9d1d9",
    outline: "none",
  },
  textarea: {
    padding: "14px 16px",
    background: "#21262d",
    border: "1px solid #30363d",
    borderRadius: "6px",
    color: "#c9d1d9",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  button: {
    padding: "14px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#58a6ff",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  success: {
    padding: "16px",
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#3fb950",
    borderRadius: "6px",
    fontWeight: 700,
    textAlign: "center",
  },
};

export default Contact;


