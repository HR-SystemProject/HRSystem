"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";

export default function MyPayrollPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    const roleName = typeof role === "string" ? role : role?.roleName;

    console.log(roleName)
    const isAdminOrHR = ["admin", "hr"].includes(roleName);

    if (roleName !== "admin" || roleName !== "hr") {
      router.replace("/unauthorized");
    }
  }, [router]);

  return (
    <div>
      <h1>iiiiiiiiii</h1>
    </div>
  );
}
