"use client";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabClass = (tab) =>
    `px-4 py-2 transition-all ${
      activeTab === tab
        ? "bg-primary text-white"
        : "font-normal"
    }`;

  return (
    <div className="flex gap-3 p-2">
      <h3 className="fw-bold my-3">Attendance Management</h3>

      <button
        onClick={() => setActiveTab("today")}
        className={tabClass("today")}
      >
        Today
      </button>

      <button
        onClick={() => setActiveTab("monthly")}
        className={tabClass("monthly")}
      >
        Monthly Report
      </button>

      <button onClick={() => setActiveTab("all")} className={tabClass("all")}>
        All Records
      </button>
    </div>
  );
}

