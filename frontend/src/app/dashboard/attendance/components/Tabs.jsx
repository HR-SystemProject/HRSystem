"use client";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabClass = (tab) =>
    `px-4 py-2 transition-all ${
      activeTab === tab ? "bg-primary text-white" : "font-normal"
    }`;

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">📑 Attendance Management</h3>
        <small className="text-muted">
          Track and manage employees’ daily attendance records.
        </small>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
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
    </div>
  );
}
