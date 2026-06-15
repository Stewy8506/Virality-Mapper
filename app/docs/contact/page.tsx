"use client";

import React, { useState } from "react";
import { Mail, Globe, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Vantage AI Inquiry",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setErrorMessage("All fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setStatus("error");
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    setStatus("success");
    setErrorMessage("");

    // Prepare mailto link
    const mailtoSubject = `${formData.subject} - from ${formData.name}`;
    const mailtoBody = `Sender Name: ${formData.name}\nSender Email: ${formData.email}\n\nMessage:\n${formData.message}`;
    const mailtoUrl = `mailto:dasanuvab38@gmail.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;

    // Open mail client after a small delay
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <Mail size={24} className="text-zinc-400" />
          <span>Contact Developer</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Get in touch with Anuvab for support, feedback, or custom integrations.
        </p>
      </div>

      <div className="developer-header-grid">
        {/* Form Container */}
        <div>
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                border: "1px solid #22c55e",
                backgroundColor: "rgba(34, 197, 94, 0.05)",
                padding: "32px",
                borderRadius: "8px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px"
              }}
            >
              <CheckCircle2 size={48} className="text-[#22c55e]" />
              <h3 style={{ margin: 0, color: "var(--zinc-100)" }}>Message Encoded</h3>
              <p style={{ margin: 0, color: "var(--zinc-400)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Opening your email client to dispatch the message. If it doesn't open automatically,
                you can manually write to <strong style={{ color: "var(--accent)" }}>dasanuvab38@gmail.com</strong>.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="custom-btn custom-btn-secondary"
                style={{ alignSelf: "center", marginTop: "8px" }}
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="typographic-form" style={{ marginTop: 0 }}>
              {status === "error" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid #ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    color: "#fca5a5",
                    fontSize: "0.85rem",
                    marginBottom: "16px"
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Row 1: Name */}
              <div className="form-row">
                <span className="row-num">01 /</span>
                <div className="row-content">
                  <label htmlFor="name" className="row-label">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Anuvab Das"
                    className="minimal-input"
                    style={{ fontSize: "1.05rem", padding: "6px 0" }}
                  />
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="form-row">
                <span className="row-num">02 /</span>
                <div className="row-content">
                  <label htmlFor="email" className="row-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@anv.dev"
                    className="minimal-input"
                    style={{ fontSize: "1.05rem", padding: "6px 0" }}
                  />
                </div>
              </div>

              {/* Row 3: Subject */}
              <div className="form-row">
                <span className="row-num">03 /</span>
                <div className="row-content">
                  <label htmlFor="subject" className="row-label">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="minimal-input"
                    style={{ fontSize: "1.05rem", padding: "6px 0" }}
                  />
                </div>
              </div>

              {/* Row 4: Message */}
              <div className="form-row">
                <span className="row-num">04 /</span>
                <div className="row-content">
                  <label htmlFor="message" className="row-label">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your request or feedback in detail..."
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px dashed var(--border-muted)",
                      width: "100%",
                      color: "var(--foreground)",
                      outline: "none",
                      resize: "vertical",
                      fontSize: "1.05rem",
                      padding: "8px 0",
                      minHeight: "120px"
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: "24px 0 0" }}>
                <button type="submit" className="custom-btn custom-btn-accent flex items-center gap-2" style={{ padding: "12px 24px", fontSize: "0.85rem" }}>
                  <span>Dispatch Message</span>
                  <Send size={14} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="system-stats-panel" style={{ height: "auto" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}># 01 / Developer Office</h3>
            <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.6 }}>
              Vantage AI is developed and maintained by Anuvab Das, a freelance systems and AI consultant.
              Have questions about deploying this at your company or setting up a custom database RAG loop?
              Get in touch!
            </p>

            <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "20px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "var(--accent)" }}><Mail size={16} /></div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--zinc-500)" }}>Primary Email</span>
                  <a href="mailto:dasanuvab38@gmail.com" style={{ fontSize: "0.85rem", color: "var(--zinc-200)", textDecoration: "none" }}>dasanuvab38@gmail.com</a>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "var(--accent)" }}><Globe size={16} /></div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--zinc-500)" }}>Personal Domain</span>
                  <a href="https://anvv.tech" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "var(--zinc-200)", textDecoration: "none" }}>https://anvv.tech</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
