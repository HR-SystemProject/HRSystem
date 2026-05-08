"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { getRole } from "@/utils/auth";
import { getMyEmployee } from "../../../services/employees";
import { getEmployeeLeaveRequests } from "../../../services/leaveRequests";
import {
  checkIn,
  checkOut,
  getMyTodayAttendance,
} from "../../../services/attendance";

export default function UserDashboardPage() {
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingAtt, setLoadingAtt] = useState(false);

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    if (roleName !== "user") {
      router.replace("/unauthorized");
      return;
    }

    fetchEmployee();
    fetchTodayAttendance();
  }, []);

  const fetchEmployee = async () => {
    try {
      setLoading(true);

      const res = await getMyEmployee();

      setEmployee(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await getMyTodayAttendance();
      setTodayAttendance(res.data.data || null);
    } catch (err) {
      console.log(err);
      setTodayAttendance(null);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const res = await getEmployeeLeaveRequests();
      setMyLeaveRequests(res.data.data || []);
    };

    fetch();
  }, []);

  const hasCheckIn = !!todayAttendance?.checkIn;
  const hasCheckOut = !!todayAttendance?.checkOut;

  const status = !hasCheckIn ? "idle" : hasCheckOut ? "out" : "in";

  const handleCheckIn = async () => {
    try {
      setLoadingAtt(true);

      await checkIn();

      await fetchTodayAttendance();

      Swal.fire({
        icon: "success",
        title: "Checked In",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message,
      });
    } finally {
      setLoadingAtt(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance?.checkIn) return;

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to check out now?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, check out",
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoadingAtt(true);

      const res = await checkOut();

      await fetchTodayAttendance();

      Swal.fire({
        icon: "success",
        title: "Checked Out",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Error",
      });
    } finally {
      setLoadingAtt(false);
    }
  };

  if (loading || !employee) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const getColor = () => {
    if (status === "idle") return "#6c757d";
    if (status === "in") return "#28a745";
    return "#dc3545";
  };

  const getText = () => {
    if (status === "idle") return "Check In";
    if (status === "in") return "Check Out";
    return "Done";
  };

  const leaveStats = {
    pending: myLeaveRequests.filter((r) => r.status === "pending").length,
    approved: myLeaveRequests.filter((r) => r.status === "approved").length,
    rejected: myLeaveRequests.filter((r) => r.status === "rejected").length,
  };
  return (
    <div className="container py-4">
      {/* EMPLOYEE CARD */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
        <div className="row g-0 align-items-center">
          <div className="col-md-8 p-4">
            <h2 className="fw-bold mb-3">
              Welcome back, {employee.userId?.name} 👋
            </h2>

            <div className="text-muted mb-2">{employee.userId?.email}</div>

            <div className="fw-semibold">{employee.jobTitle}</div>

            <div className="text-muted">{employee.departmentId?.name}</div>
          </div>

          <div className="col-md-4 text-center p-4">
            <img
              src="/Userdashboard.jpg"
              alt="dashboard"
              className="img-fluid"
              style={{
                maxHeight: "240px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 flex-wrap">
        {/* ATTENDANCE */}
        <div
          className="bg-white shadow-sm rounded-4 p-4 text-center card"
          style={{ width: "300px" }}
        >
          <small className="fw-bold d-block mb-3">Attendance</small>

          <div className="mb-3">
            <span
              className={`badge ${
                !todayAttendance?.checkIn
                  ? "bg-secondary"
                  : todayAttendance?.checkOut
                    ? "bg-danger"
                    : "bg-success"
              }`}
            >
              {!todayAttendance?.checkIn
                ? "Not Checked In"
                : todayAttendance?.checkOut
                  ? "Checked Out"
                  : "Checked In"}
            </span>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <div
              onClick={!todayAttendance?.checkIn ? handleCheckIn : null}
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "85px",
                height: "85px",
                background: todayAttendance?.checkIn ? "#adb5bd" : "#28a745",
                color: "white",
                cursor: todayAttendance?.checkIn ? "not-allowed" : "pointer",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "40px" }}>𖦹</span>
              <small style={{ fontSize: "11px" }}>In</small>
            </div>

            <div
              onClick={
                todayAttendance?.checkIn && !todayAttendance?.checkOut
                  ? handleCheckOut
                  : null
              }
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "85px",
                height: "85px",
                background: !todayAttendance?.checkIn
                  ? "#adb5bd"
                  : todayAttendance?.checkOut
                    ? "#dc3545"
                    : "#ffc107",
                color: "white",
                cursor:
                  todayAttendance?.checkIn && !todayAttendance?.checkOut
                    ? "pointer"
                    : "not-allowed",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "40px" }}>𖦹</span>
              <small style={{ fontSize: "11px" }}>Out</small>
            </div>
          </div>

          <div className="mt-4 small text-muted">
            <div>
              <strong>Check In:</strong>{" "}
              {todayAttendance?.checkIn
                ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                : "--"}
            </div>

            <div>
              <strong>Check Out:</strong>{" "}
              {todayAttendance?.checkOut
                ? new Date(todayAttendance.checkOut).toLocaleTimeString()
                : "--"}
            </div>
          </div>
        </div>

        {/* LEAVE REQUEST STATS */}
        <div
          className="bg-white shadow-sm rounded-4 p-4 card"
          style={{ width: "300px" }}
        >
          <small className="fw-bold d-block mb-4">Leave Requests</small>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center py-1">
              <span className="text-muted">Pending</span>
              <span className="badge bg-warning text-dark px-3 py-2">
                {leaveStats.pending}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center py-1">
              <span className="text-muted">Approved</span>
              <span className="badge bg-success px-3 py-2">
                {leaveStats.approved}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center py-1">
              <span className="text-muted">Rejected</span>
              <span className="badge bg-danger px-3 py-2">
                {leaveStats.rejected}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
