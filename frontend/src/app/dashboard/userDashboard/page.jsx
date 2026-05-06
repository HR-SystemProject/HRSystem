"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";

export default function UserDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string"
        ? role
        : role?.roleName || role?.role?.roleName;

    if (roleName !== "user") {
      router.replace("/unauthorized");
    }
  }, [router]);

  return (
    <div>
      <h1>iiiiiiiiii</h1>
    </div>
  );
}