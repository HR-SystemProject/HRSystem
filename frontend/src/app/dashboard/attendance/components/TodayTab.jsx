"use client";
import React, { useState, useEffect } from "react";
import { getTodayAttendance } from "../../../../services/attendance";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const filteredAttendance = attendance.filter((item) =>
    item.userId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAttendance.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

  if (loading)
    return (
      <div className=" py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading attendance...</p>
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white shadow-sm rounded">
        {/* LEFT */}
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0">🗓️ Today’s Attendance</h5>

          <small
            className="text-muted rounded px-2 py-1"
            style={{ background: "#e8e8e8" }}
          >
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
          </small>
        </div>

        {/* RIGHT (Search) */}
        <input
          type="text"
          className="form-control w-25"
          style={{ width: "220px" }}
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
      {filteredAttendance.length === 0 ? (
        <div className=" text-muted py-5 mx-auto">
          <h5>No attendance records for today</h5>
          <small>Employees haven’t checked in yet</small>
        </div>
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
            {paginatedData.map((item, index) => (
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
                    className={`badge ${
                      item.status === "present"
                        ? "bg-success"
                        : item.status === "late"
                          ? "bg-warning text-dark"
                          : "bg-danger"
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
      <div className="d-flex justify-content-center mt-4 gap-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
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
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
