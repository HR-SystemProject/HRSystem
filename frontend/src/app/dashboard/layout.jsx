//  Protected layout
//  Checks if user is logged in
//  Redirects to /login if not
//  Contains Sidebar + Topbar
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(storedUser);
    }
  }, []);

  if (!user) return <div className="p-5">Loading...</div>;

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div style={{ width: "200px", minHeight: "100vh" }}>
        <Sidebar role={user.role} />
      </div>

      <div className="flex-grow-1 bg-light">
        <Topbar user={user} />

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
