"use client";
import React, { useState, useEffect } from "react";
import { getAttendance } from "../../../../services/attendance";
import { getUsers } from "../../../../services/users";

export default function AllRecordsTab() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAttendance();
      setAttendance(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getUsers();
      setEmployees(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const getValue = (item, key) => {
    switch (key) {
      case "name":
        return item.employeeId?.name || "";
      case "date":
        return new Date(item.date);
      case "status":
        return item.status;
      case "workingTime":
        return item.workingTime || "";
      default:
        return "";
    }
  };

  const getEmployeeName = (item) =>
    item.employeeId?.userId?.name || item.employeeId?.name || "";

  const processedData = attendance
    .filter((item) =>
      getEmployeeName(item).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((item) => {
      if (selectedDate) {
        const d = new Date(item.date).toISOString().split("T")[0];
        if (d !== selectedDate) return false;
      }

      if (selectedStatus && item.status !== selectedStatus) return false;

      if (selectedEmployee && item.employeeId?._id !== selectedEmployee)
        return false;

      return true;
    })
    .sort((a, b) => {
      const aVal = getValue(a, sortConfig.key);
      const bVal = getValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container py-1">
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold">📋 All Attendance Records</h4>
        <small className="text-muted">Total: {processedData.length}</small>
      </div>

      {/* FILTERS */}
      <div className="mb-3 d-flex gap-3 flex-wrap align-items-center justify-content-center">
        <input
          className="form-control"
          style={{ width: "200px" }}
          placeholder="Search ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <input
          type="date"
          className="form-control"
          style={{ width: "180px" }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <select
          className="form-select"
          style={{ width: "180px" }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>


        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => {
            setSearch("");
            setSelectedDate("");
            setSelectedStatus("");
            setSelectedEmployee("");
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="table-responsive bg-white shadow-sm rounded">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th
                onClick={() => handleSort("name")}
                style={{ cursor: "pointer" }}
              >
                Employee
              </th>

              <th
                onClick={() => handleSort("date")}
                style={{ cursor: "pointer" }}
              >
                Date
              </th>

              <th
                onClick={() => handleSort("status")}
                style={{ cursor: "pointer" }}
              >
                Status
              </th>

              <th>Check In</th>
              <th>Check Out</th>

              <th
                onClick={() => handleSort("workingTime")}
                style={{ cursor: "pointer" }}
              >
                Working Time
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item._id || item.date}>
                  <td>
                    <div className="fw-semibold">{getEmployeeName(item)}</div>
                    <small className="text-muted">
                      {item.employeeId?.email}
                    </small>
                  </td>

                  <td>{new Date(item.date).toLocaleDateString()}</td>

                  <td>
                    <span className={`badge bg-${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.checkIn
                      ? new Date(item.checkIn).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td>
                    {item.checkOut
                      ? new Date(item.checkOut).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="fw-semibold">{item.workingTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-3 gap-2">
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
