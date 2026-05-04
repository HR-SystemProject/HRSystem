"use client";
import { useState } from "react";
import { signup } from "../../../services/users";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await signup(form);
      alert("User created");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm p-4 transition-card" style={{ width: "400px" }}>
        <h4 className="fw-bold text-center mb-3">Signup</h4>

        <input name="name" className="form-control mb-2" placeholder="Name" onChange={handleChange} />
        <input name="email" className="form-control mb-2" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" className="form-control mb-3" placeholder="Password" onChange={handleChange} />

        <button className="btn btn-primary w-100" onClick={handleSubmit}>
          Signup
        </button>
      </div>
    </div>
  );
}