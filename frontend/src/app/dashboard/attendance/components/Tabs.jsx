"use client";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabClass = (tab) =>
  `px-4 py-2 transition-all font-semibold ${
    activeTab === tab
      ? "text-primary shadow-md"
      : "hover:font-bold"
  }`;                              


  return (
    <div className="flex gap-3 p-2 bg-white rounded-lg shadow-sm w-fit">
      <h3 className="fw-bold my-3">Departments Management</h3>

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

      <button
        onClick={() => setActiveTab("history")}
        className={tabClass("history")}
      >
        Employee History
      </button>

      <button onClick={() => setActiveTab("all")} className={tabClass("all")}>
        All Records
      </button>
    </div>
  );
}
