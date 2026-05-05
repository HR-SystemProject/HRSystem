"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../../../services/users";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    let newErrors = {};

    // validation
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      router.push("/auth/login");
    } catch (err) {
      console.log(err);

      const message = err?.response?.data?.message;
      console.log("ERROR FULL:", err.response?.data);
      if (message) {
        if (message.includes("Password")) {
          setErrors({ password: message });
        } else if (message.includes("Email")) {
          setErrors({ email: message });
        } else {
          setErrors({ general: message });
        }
      } else {
        setErrors({
          general: "Server error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div
        className="login-class d-flex justify-content-center align-items-center"
        style={{
          borderRadius: "16px",
          minHeight: "80vh",
          padding: "30px",
        }}
      >
        {/* CARD */}
        <div style={{ width: "100%", maxWidth: "380px", color: "#0f172a" }}>
          {/* HEADER */}
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: "#0f172a" }}>
              Create Your Account
            </h2>
            <p style={{ color: "#0f172a" }}>
              Join us and simplify HR management
            </p>
          </div>

          {/* NAME */}
          <label style={{ color: "#334155", fontWeight: "500" }}>Name</label>
          <input
            name="name"
            className="form-control my-2"
            placeholder="Enter name"
            onChange={handleChange}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
            }}
          />
          {errors.name && (
            <small
              style={{
                color: "#ef4444",
                display: "block",
                marginBottom: "10px",
              }}
            >
              {errors.name}
            </small>
          )}

          {/* EMAIL */}
          <label style={{ color: "#334155", fontWeight: "500" }}>Email</label>
          <input
            name="email"
            className="form-control my-2"
            placeholder="Enter email"
            onChange={handleChange}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
            }}
          />
          {errors.email && (
            <small
              style={{
                color: "#ef4444",
                display: "block",
                marginBottom: "10px",
              }}
            >
              {errors.email}
            </small>
          )}

          {/* PASSWORD */}
          <label style={{ color: "#334155", fontWeight: "500" }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            className="form-control my-2"
            placeholder="Enter password"
            onChange={handleChange}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
            }}
          />
          {errors.password && (
            <small
              style={{
                color: "#ef4444",
                display: "block",
                marginBottom: "10px",
              }}
            >
              {errors.password}
            </small>
          )}

          {/* CONFIRM PASSWORD */}
          <label style={{ color: "#334155", fontWeight: "500" }}>
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            className="form-control my-2"
            placeholder="Confirm password"
            onChange={handleChange}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
            }}
          />
          {errors.confirmPassword && (
            <small
              style={{
                color: "#ef4444",
                display: "block",
                marginBottom: "10px",
              }}
            >
              {errors.confirmPassword}
            </small>
          )}
          {/* GENERAL ERROR */}
          {errors.general && (
            <div
              className="mb-3 text-center"
              style={{
                color: "#ef4444",
                background: "rgba(239,68,68,0.1)",
                padding: "8px",
                borderRadius: "8px",
              }}
            >
              {errors.general}
            </div>
          )}

          {/* BUTTON */}
          <button
            className="btn w-100 fw-bold my-3"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: "#71b3f4",
              border: "none",
              color: "white",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Signup"}
          </button>

          {/* LOGIN LINK */}
          <p className="text-center small" style={{ color: "#64748b" }}>
            Do you have an account?{" "}
            <a href="/auth/login" style={{ color: "#71b3f4" }}>
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
