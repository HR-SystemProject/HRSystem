"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../utils/auth";
import { login } from "../../../services/auth";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) return;

    const user = JSON.parse(localStorage.getItem("user"));

    const roleName = user?.role?.roleName?.toLowerCase();

    const hasEmployee = res.data.user.employeeId ? true : false;

    localStorage.setItem("hasEmployee", JSON.stringify(hasEmployee));

    if (roleName === "admin" || roleName === "hr") {
      router.replace("/dashboard/dashboard");
    } else if (roleName === "user") {
      router.replace("/dashboard/userDashboard");
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    let newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const res = await login(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const roleName = res.data.user.role?.roleName?.toLowerCase();

      if (roleName === "user") {
        router.push("/dashboard/userDashboard");
      } else {
        router.push("/dashboard/dashboard");
      }
    } catch (error) {
      console.log(error);

      setErrors({
        general: error?.response?.data?.message || "Login failed",
      });
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
              Welcome Back
            </h2>
            <p style={{ color: "#0f172a" }}>Login to your HR system account</p>
          </div>

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
          {/* FORGOT PASSWORD */}
          <div className="text-end my-2">
            <a
              href="/auth/forget-password"
              style={{
                fontSize: "13px",
                color: "#71b3f4",
                textDecoration: "none",
              }}
            >
              Forgot your password?
            </a>
          </div>

          {/* GENERAL ERROR */}
          {errors.general && (
            <div
              className="my-3 text-center"
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
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* SIGNUP LINK */}
          <p className="text-center small" style={{ color: "#64748b" }}>
            Don’t have an account?{" "}
            <a href="/auth/signup" style={{ color: "#71b3f4" }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
