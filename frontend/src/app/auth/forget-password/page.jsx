"use client";
import { useState } from "react";
import { forgetPassword } from "../../../services/users";

export default function Page() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await forgetPassword({ email });
      alert("Reset link sent");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm p-4 transition-card" style={{ width: "400px" }}>
        <h4 className="fw-bold text-center mb-3">Forget Password</h4>

        <input
          className="form-control mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn btn-warning w-100" onClick={handleSubmit}>
          Send Reset Link
        </button>
      </div>
    </div>
  );
}