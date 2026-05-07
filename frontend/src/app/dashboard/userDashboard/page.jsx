"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { getRole } from "@/utils/auth";
import { getMyEmployee } from "../../../services/employees";
import {
  checkIn,
  checkOut,
  getMyTodayAttendance,
} from "../../../services/attendance";

export default function UserDashboardPage() {
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);

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

  // ================= EMPLOYEE =================
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

  // ================= TODAY ATTENDANCE =================
  const fetchTodayAttendance = async () => {
    try {
      const res = await getMyTodayAttendance();
      setTodayAttendance(res.data.data || null);
    } catch (err) {
      console.log(err);
      setTodayAttendance(null);
    }
  };

  // ================= STATES =================
  const hasCheckIn = !!todayAttendance?.checkIn;
  const hasCheckOut = !!todayAttendance?.checkOut;

  const status = !hasCheckIn ? "idle" : hasCheckOut ? "out" : "in";

  // ================= CHECK IN =================
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

  // ================= LOADING =================
  if (loading || !employee) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  // ================= COLORS =================
  const getColor = () => {
    if (status === "idle") return "#6c757d";
    if (status === "in") return "#28a745";
    return "#dc3545";
  };

  // ================= TEXT =================
  const getText = () => {
    if (status === "idle") return "Check In";
    if (status === "in") return "Check Out";
    return "Done";
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

      {/* ATTENDANCE */}
      <div className="d-flex justify-content-start">
        <div
          className="bg-white shadow-sm rounded-4 p-4 text-center"
          style={{ width: "300px" }}
        >
          <small className="fw-bold d-block mb-3">Attendance</small>

          {/* STATUS */}
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

          {/* CIRCLES */}
          <div className="d-flex justify-content-center gap-3">
            {/* CHECK IN */}
            <div
              onClick={!todayAttendance?.checkIn ? handleCheckIn : null}
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "85px",
                height: "85px",
                background: todayAttendance?.checkIn ? "#adb5bd" : "#28a745",
                color: "white",
                cursor: todayAttendance?.checkIn ? "not-allowed" : "pointer",
                boxShadow: "0 0 15px rgba(40,167,69,0.3)",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "40px" }}>𖦹</span>
              <small style={{ fontSize: "11px" }}>In</small>
            </div>

            {/* CHECK OUT */}
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
                boxShadow: "0 0 15px rgba(220,53,69,0.3)",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "40px" }}>𖦹</span>
              <small style={{ fontSize: "11px" }}>Out</small>
            </div>
          </div>

          {/* TIMES */}
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
      </div>
    </div>
  );
}
