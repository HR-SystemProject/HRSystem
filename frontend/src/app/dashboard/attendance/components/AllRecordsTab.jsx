"use client";
import React, { useState, useEffect } from "react";
import { getAllAttendance } from "../../../../services/attendance";
import { getUsers } from "../../../../services/users";

export default function AllRecordsTab() {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  useEffect(() => {
    let data = [...attendance];

    // FILTER BY DATE
    if (selectedDate) {
      data = data.filter((item) => {
        const itemDate = new Date(item.date).toISOString().split("T")[0];
        return itemDate === selectedDate;
      });
    }

    // FILTER BY STATUS
    if (selectedStatus) {
      data = data.filter((item) => item.status === selectedStatus);
    }

    // FILTER BY EMPLOYEE
    if (selectedEmployee) {
      data = data.filter(
        (item) => item.employeeId?._id === selectedEmployee
      );
    }

    setFiltered(data);
  }, [selectedDate, selectedStatus, selectedEmployee, attendance]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await getAllAttendance();
      setAttendance(res.data.data);
      setFiltered(res.data.data);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getUsers();
      setEmployees(res.data.data);
    } catch (err) {
      console.log("Error loading employees", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "danger";
      case "forgot_checkout":
        return "secondary";
      default:
        return "dark";
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold">📋 All Attendance Records</h4>
        <small className="text-muted">
          Total: {filtered.length}
        </small>
      </div>

      {/* FILTERS */}
      <div className="mb-4 d-flex gap-3 flex-wrap">

        {/* DATE */}
        <input
          type="date"
          className="form-control w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {/* STATUS */}
        <select
          className="form-select w-auto"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>

        {/* EMPLOYEE DROPDOWN */}
        <select
          className="form-select w-auto"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        {/* RESET */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setSelectedDate("");
            setSelectedStatus("");
            setSelectedEmployee("");
          }}
        >
          Reset
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-3">
        {filtered.map((item, index) => (
          <div className="col-md-4" key={index}>
            <div className="p-3 bg-white shadow-sm rounded h-100">

              <h6 className="fw-bold mb-1">
                👤 {item.employeeId?.name || "Unknown"}
              </h6>

              <small className="text-muted d-block mb-2">
                {item.employeeId?.email}
              </small>

              <hr />

              <p>📅 {new Date(item.date).toLocaleDateString()}</p>

              <p>
                🟢 Status:{" "}
                <span className={`text-${getStatusColor(item.status)} fw-bold`}>
                  {item.status}
                </span>
              </p>

              <p>
                ⏰ In:{" "}
                {item.checkIn
                  ? new Date(item.checkIn).toLocaleTimeString()
                  : "-"}
              </p>

              <p>
                ⏰ Out:{" "}
                {item.checkOut
                  ? new Date(item.checkOut).toLocaleTimeString()
                  : "Still working"}
              </p>

              <p className="fw-semibold">
                ⏱ {item.workingTime}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}