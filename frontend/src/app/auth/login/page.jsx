"use client";
import { useState } from "react";
import { login } from "../../../services/auth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      alert("Login successful");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm p-4 transition-card" style={{ width: "400px" }}>
        <h4 className="fw-bold mb-3 text-center">Login</h4>

        <input
          name="email"
          className="form-control mb-2"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="btn btn-success w-100" onClick={handleSubmit}>
          Login
        </button>
      </div>
    </div>
  );
}