"use client";

import React, { useState, useEffect } from "react";
import { getMonthlyAttendanceReport } from "../../../../services/attendance";

export default function MonthlyTab() {
  const [report, setReport] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMonthlyAttendanceReport(month);
      setReport(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading report");
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  const filteredReport = (report || []).filter((item) =>
    item.user?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  const paginatedData = filteredReport.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPresent = report.reduce((sum, e) => sum + e.presentDays, 0);
  const totalLate = report.reduce((sum, e) => sum + e.lateDays, 0);
  const totalAbsent = report.reduce((sum, e) => sum + e.absentDays, 0);

  const total = totalPresent + totalLate + totalAbsent;

  const percent = (value) => (total ? ((value / total) * 100).toFixed(0) : 0);

  const formatHours = (value) => {
    if (!value && value !== 0) return "0h 0m";

    const h = Math.floor(value);
    const m = Math.round((value - h) * 60);

    return `${h}h ${m}m`;
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">📊 Monthly Attendance Report</h4>

      {/* controls */}
      <div className="bg-white p-3 shadow-sm rounded mb-3">
        <div className="d-flex gap-2 mb-3">
          <select
            className="form-select w-25"
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <input
            className="form-control w-25"
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
           <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => {
            setSearch("");
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
        </div>

        {/* summary */}
        <div className="mb-2">
          <small>Present</small>
          <div className="progress mb-2">
            <div
              className="progress-bar bg-success"
              style={{ width: `${percent(totalPresent)}%` }}
            />
          </div>
        </div>

        <div className="mb-2">
          <small>Late</small>
          <div className="progress mb-2">
            <div
              className="progress-bar bg-warning"
              style={{ width: `${percent(totalLate)}%` }}
            />
          </div>
        </div>

        <div>
          <small>Absent</small>
          <div className="progress">
            <div
              className="progress-bar bg-danger"
              style={{ width: `${percent(totalAbsent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* states */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* table */}
      {!loading && paginatedData.length === 0 ? (
        <div className="text-center text-muted mt-4">
          No attendance data for this month
        </div>
      ) : (
        <table className="table table-hover bg-white shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th>Employee</th>
              <th>Working Hours</th>
              <th>Present</th>
              <th>Late</th>
              <th>Absent</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.name}</td>

                <td>{formatHours(item.totalHours)}</td>

                <td className="text-success">{item.presentDays}</td>
                <td className="text-warning">{item.lateDays}</td>
                <td className="text-danger">{item.absentDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* pagination */}
      <div className="d-flex justify-content-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`btn btn-sm ${
              currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
