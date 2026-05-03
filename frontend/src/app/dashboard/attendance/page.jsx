"use client";
import { useState } from "react";
import Tabs from "./components/Tabs";
import TodayTab from "./components/TodayTab";
import MonthlyTab from "./components/MonthlyTab";
import HistoryTab from "./components/HistoryTab";
import AllRecordsTab from "./components/AllRecordsTab";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("today");
  return (
    <div>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "today" && <TodayTab />}
      {activeTab === "monthly" && <MonthlyTab />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "all" && <AllRecordsTab />}
    </div>
  );
}
