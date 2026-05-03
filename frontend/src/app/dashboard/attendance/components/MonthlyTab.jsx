"use client";
import React, { useState, useEffect } from "react";
import { getMonthlyAttendanceReport } from "../../../../services/attendance";

export default function MonthlyTab() {
  const [report, setReport] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPresent = report.reduce((sum, e) => sum + e.presentDays, 0);
  const totalLate = report.reduce((sum, e) => sum + e.lateDays, 0);
  const totalAbsent = report.reduce((sum, e) => sum + e.absentDays, 0);

  const total = totalPresent + totalLate + totalAbsent;
  const percent = (value) => (total ? ((value / total) * 100).toFixed(0) : 0);

  const getHours = (time) => {
    if (!time) return 0;

    const match = time.match(/(\d+)h/);
    return match ? Number(match[1]) : 0;
  };

  const getWorkColor = (time) => {
    const hours = getHours(time);
    return hours > 160 ? "text-success fw-bold" : "text-danger fw-bold";
  };

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

  useEffect(() => {
    fetchReport();
  }, [month]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMonthlyAttendanceReport(month);
      setReport(res.data.data);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading report");
      setReport([]);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <h4 className="fw-bold mb-3">Monthly Attendance Report</h4>

      {/* Month selector */}
      <select
        className="form-select w-25 mb-3"
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
      >
        {months.map((m, index) => (
          <option key={index} value={index + 1}>
            {m}
          </option>
        ))}
      </select>

      <div className="bg-white p-3 shadow-sm rounded mb-3">
        <h6 className="fw-bold mb-3">Monthly Attendance Rate</h6>

        {/* Present */}
        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <small>Present</small>
            <small className="fw-bold text-success">
              {percent(totalPresent)}%
            </small>
          </div>

          <div className="progress">
            <div
              className="progress-bar bg-success"
              style={{ width: `${percent(totalPresent)}%` }}
            ></div>
          </div>
        </div>

        {/* Late */}
        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <small>Late</small>
            <small className="fw-bold text-warning">
              {percent(totalLate)}%
            </small>
          </div>

          <div className="progress">
            <div
              className="progress-bar bg-warning"
              style={{ width: `${percent(totalLate)}%` }}
            ></div>
          </div>
        </div>

        {/* Absent */}
        <div>
          <div className="d-flex justify-content-between">
            <small>Absent</small>
            <small className="fw-bold text-danger">
              {percent(totalAbsent)}%
            </small>
          </div>

          <div className="progress">
            <div
              className="progress-bar bg-danger"
              style={{ width: `${percent(totalAbsent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* States */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* TABLE */}
      {report.length > 0 && (
        <table className="table table-hover bg-white shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th>Employee</th>
              <th>Working Time</th>
              <th>Present</th>
              <th>Late</th>
              <th>Absent</th>
            </tr>
          </thead>

          <tbody>
            {report.map((item, index) => (
              <tr key={index} className="align-middle">
                <td className="fw-semibold">{item.employee.name}</td>
                <td className={getWorkColor(item.totalWorkingTime)}>
                  {item.totalWorkingTime}
                </td>
                <td className="text-success">{item.presentDays}</td>
                <td className="text-warning">{item.lateDays}</td>
                <td className="text-danger">{item.absentDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
