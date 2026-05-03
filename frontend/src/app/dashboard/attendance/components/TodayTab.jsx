"use client";
import React, { useState, useEffect } from "react";
import { getTodayAttendance } from "../../../../services/attendance";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const date = new Date();

  const formatted = `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}/${date.getFullYear()}`;

  useEffect(() => {
    fetchAttendanceTodayData();
  }, []);

  const fetchAttendanceTodayData = async () => {
    try {
      const res = await getTodayAttendance();
      setAttendance(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = attendance.length;

  const presentEmployees = attendance.filter(
    (a) => a.status === "present",
  ).length;

  const lateEmployees = attendance.filter((a) => a.status === "late").length;

  const absentEmployees = attendance.filter(
    (a) => a.status === "absent",
  ).length;

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white shadow-sm rounded">
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0">🗓️ Today’s Attendance</h5>

          <small
            className="text-muted rounded p-2"
            style={{ background: "#e8e8e8" }}
          >
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
          </small>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* Total */}
        <div className="col-md-3 ">
          <div
            className="d-flex align-items-center justify-content-between p-3 shadow-sm rounded h-100 border-start border-primary border-4 transition-card"
            style={{ background: "#e8eeff" }}
          >
            <div className="d-flex align-items-center gap-2">
              <h6 className="text-muted mb-1">Total Employees</h6>
              <h4 className="fw-bold mb-0">{totalEmployees}</h4>
            </div>

            <div className="fs-2">👥</div>
          </div>
        </div>

        {/* Present */}
        <div className="col-md-3">
          <div
            className="d-flex align-items-center justify-content-between p-3 shadow-sm rounded h-100 border-start border-success border-4 transition-card"
            style={{ background: "#eeffea" }}
          >
            <div className="d-flex align-items-center gap-2">
              <h6 className="text-muted mb-1">Present</h6>
              <h4 className="fw-bold text-success mb-0">{presentEmployees}</h4>
            </div>

            <div className="fs-2">✅</div>
          </div>
        </div>

        {/* Late */}
        <div className="col-md-3">
          <div
            className="d-flex align-items-center justify-content-between p-3 shadow-sm rounded h-100 border-start border-warning border-4 transition-card"
            style={{ background: "#fffde6" }}
          >
            <div className="d-flex align-items-center gap-2">
              <h6 className="text-muted mb-1">Late</h6>
              <h4 className="fw-bold text-warning mb-0">{lateEmployees}</h4>
            </div>

            <div className="fs-2">⏰</div>
          </div>
        </div>

        {/* Absent */}
        <div className="col-md-3">
          <div
            className="d-flex align-items-center justify-content-between p-3 shadow-sm rounded h-100 border-start border-danger border-4 transition-card"
            style={{ background: "#ffeded" }}
          >
            <div className="d-flex align-items-center gap-2">
              <h6 className="text-muted mb-1">Absent</h6>
              <h4 className="fw-bold text-danger mb-0">{absentEmployees}</h4>
            </div>

            <div className="fs-2">❌</div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      {attendance.length === 0 ? (
        <p className="text-gray-500">No records today</p>
      ) : (
        <table className="table table-hover table-striped w-100 bg-white shadow-sm rounded overflow-hidden">
          <thead className="table-light">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Check In</th>
              <th className="p-3">Check Out</th>
              <th className="p-3">Status</th>
              <th className="p-3">Working Time</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((item, index) => (
              <tr key={index} className="align-middle">
                <td className="p-3">{item.userId?.name}</td>

                <td className="p-3">
                  <span
                    className={`fw-semibold ${
                      item.status === "late"
                        ? "text-warning"
                        : item.status === "absent"
                          ? "text-danger"
                          : "text-dark"
                    }`}
                  >
                    {item.checkIn
                      ? new Date(item.checkIn).toLocaleTimeString()
                      : "-"}
                  </span>
                </td>

                <td className="p-3">
                  <span className="fw-semibold text-dark">
                    {item.checkOut
                      ? new Date(item.checkOut).toLocaleTimeString()
                      : "-"}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`fw-semibold ${
                      item.status === "absent"
                        ? "text-danger"
                        : item.status === "late"
                          ? "text-warning"
                          : "text-dark"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-3">{item.workingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
