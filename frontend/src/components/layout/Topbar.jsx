"use client";

import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Topbar({ user }) {
  const router = useRouter();

  const toggleDashboard = () => {
    const role = getRole();

    const roleName =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    if (!["admin", "hr"].includes(roleName)) return;

    const isAdminDashboard = window.location.pathname.includes(
      "dashboard/dashboard",
    );

    if (isAdminDashboard) {
      router.push("/dashboard/userDashboard");
    } else {
      router.push("/dashboard/dashboard");
    }
  };

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
        {["admin", "hr"].includes(
          typeof getRole() === "string"
            ? getRole()
            : getRole()?.roleName || getRole()?.role?.roleName,
        ) && (
          <button
            onClick={toggleDashboard}
            className="btn btn-primary btn-sm mx-2"
          >
            Switch Dashboard
          </button>
        )}
      </div>

      {/* right */}
      <button
        onClick={handleLogout}
        className="btn btn-outline-danger btn-sm mx-4"
      >
        <FaSignOutAlt className="mx-2" />
        Logout
      </button>
    </div>
  );
}
