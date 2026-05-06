"use client";
import { useState, useEffect } from "react";
import Tabs from "./components/Tabs";
import TodayTab from "./components/TodayTab";
import MonthlyTab from "./components/MonthlyTab";
import AllRecordsTab from "./components/AllRecordsTab";
import { getRole } from "../../../utils/auth";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("today");
  
  const role = getRole();

  useEffect(() => {
    if (!role || !["admin", "hr"].includes(role.roleName)) {
      router.push("/unauthorized");
    }
  }, []);

  return (
    <div>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "today" && <TodayTab />}
      {activeTab === "monthly" && <MonthlyTab />}
      {activeTab === "all" && <AllRecordsTab />}
    </div>
  );
}
