"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRole } from "@/utils/auth";
import { FaSignOutAlt } from "react-icons/fa";

export default function Topbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  const [roleName, setRoleName] = useState(null);

  // get role once
  useEffect(() => {
    const role = getRole();

    const name =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    setRoleName(name?.toLowerCase()?.trim());
  }, []);

  // switch dashboard
  const toggleDashboard = () => {
  const role = getRole();
  

  const roleName =
    typeof role === "string"
      ? role
      : role?.roleName || role?.role?.roleName;

  const cleanRole = roleName?.toLowerCase()?.trim();

  if (!cleanRole || !["admin", "hr"].includes(cleanRole)) return;

  const isAdminDashboard = pathname.includes("dashboard/dashboard");

  if (isAdminDashboard) {
    router.replace("/dashboard/userDashboard");
  } else {
    router.replace("/dashboard/dashboard");
  }
};

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/auth/login");
  };

  return (
    <div className="h-16 bg-white shadow p-3 d-flex align-items-center justify-content-between">
      {/* LEFT */}
      <div className="d-flex align-items-center gap-2">
        <span>👤 Welcome</span>

        <span className="fw-bold text-primary">{user?.name}</span>

        {/* switch button only admin/hr */}
        {["admin", "hr"].includes(roleName) && (
          <button
            onClick={toggleDashboard}
            className="btn btn-primary btn-sm mx-2"
          >
            Switch Dashboard
          </button>
        )}
      </div>

      {/* RIGHT */}
      <button
        onClick={handleLogout}
        className="btn btn-outline-danger btn-sm mx-4 d-flex align-items-center gap-2"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
}
