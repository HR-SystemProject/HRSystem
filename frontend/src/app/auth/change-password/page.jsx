"use client";
import { useState } from "react";
import { changePassword } from "../../services/user";

export default function ChangePassword() {
  const [form, setForm] = useState({
    token: "",
    newPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await changePassword(form);
      alert("Password changed");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm p-4 transition-card" style={{ width: "400px" }}>
        <h4 className="fw-bold text-center mb-3">Change Password</h4>

        <input
          name="token"
          className="form-control mb-2"
          placeholder="Token"
          onChange={handleChange}
        />

        <input
          name="newPassword"
          type="password"
          className="form-control mb-3"
          placeholder="New Password"
          onChange={handleChange}
        />

        <button className="btn btn-primary w-100" onClick={handleSubmit}>
          Change Password
        </button>
      </div>
    </div>
  );
}