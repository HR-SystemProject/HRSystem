"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) return <div className="p-5">Loading...</div>;

  return (
    <div className="d-flex  min-vh-100">
      <div style={{ width: "200px" }} className="bg-dark">
        <Sidebar role={user?.role?.roleName} />
      </div>

      <div className="flex-grow-1 bg-light d-flex flex-column">
        <Topbar user={user} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
