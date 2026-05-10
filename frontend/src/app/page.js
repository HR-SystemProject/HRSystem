"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();

    const roleName = role?.roleName?.toLowerCase();

    if (roleName === "admin" || roleName === "hr") {
      router.replace("/dashboard/dashboard");
    }
    else if (roleName === "user") {
      router.replace("/dashboard/userDashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  return null;
}
