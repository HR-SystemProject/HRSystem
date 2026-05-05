"use client";

import { useRouter } from "next/navigation";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";


export default function Topbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  return (
    <div className="h-16 bg-white shadow p-3 d-flex align-items-center justify-content-between">
      {/* left */}
      <div className="d-flex align-items-center gap-2">
        <span>👤 Welcome</span>
        <span className="fw-bold text-primary">{user?.name}</span>
      </div>

      {/* right */}
      <button onClick={handleLogout} className="btn btn-outline-danger btn-sm mx-4">
        <FaSignOutAlt className="mx-2"/>
        Logout
      </button>
    </div>
  );
}
