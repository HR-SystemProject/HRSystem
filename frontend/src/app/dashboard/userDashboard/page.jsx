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
  getMonthlyAttendance,
} from "../../../services/attendance";
import { getEmployeePayroll } from "../../../services/payroll";

export default function UserDashboardPage() {
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [monthly, setMonthly] = useState(null);

  const [loading, setLoading] = useState(false);
  const [payroll, setPayroll] = useState(null);
  const [loadingAtt, setLoadingAtt] = useState(false);

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    if (!["user", "admin", "hr"].includes(roleName)) {
      router.replace("/unauthorized");
      return;
    }

    const hasEmployee = JSON.parse(localStorage.getItem("hasEmployee"));

    fetchTodayAttendance();

    fetchMonthly();

    if (hasEmployee || roleName === "user") {
      fetchEmployee();
      fetchPayroll();
    }
  }, []);

  const fetchEmployee = async () => {
    const hasEmployee = JSON.parse(localStorage.getItem("hasEmployee"));

    if (!hasEmployee) {
      setEmployee(null);
      return;
    }

    try {
      setLoading(true);

      const res = await getMyEmployee();

      setEmployee(res.data.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setEmployee(null);
        return;
      }

      console.log("Employee error:", err);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await getMyTodayAttendance();
      setTodayAttendance(res.data.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setTodayAttendance(null);
        return;
      }

      console.log("Attendance error:", err);
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

  const fetchMonthly = async () => {
    try {
      const month = new Date().getMonth() + 1;
      const res = await getMonthlyAttendance(month);

      setMonthly(res.data.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setMonthly(null);
        return;
      }

      console.log("Monthly error:", err);
      setMonthly(null);
    }
  };

  const fetchPayroll = async () => {
    try {
      const res = await getEmployeePayroll();

      const currentMonth = new Date().toISOString().slice(0, 7);

      const payrolls = res.data.data || [];

      const currentPayroll = payrolls.find((p) => p.month === currentMonth);

      setPayroll(currentPayroll || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setPayroll(null);
        return;
      }

      console.log("Payroll error:", err);
      setPayroll(null);
    }
  };

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

  const monthlyHours = monthly?.totalHours ? Number(monthly.totalHours) : 0;

  const percent = 160 > 0 ? (monthlyHours / 160) * 100 : 0;
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
              style={{ maxHeight: "240px", objectFit: "contain" }}
            />
          </div>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="row g-4">
        {/* ATTENDANCE */}
        <div className="col-12 col-md-4" style={{ minHeight: "200px" }}>
          <div className="bg-white shadow-sm rounded-4 p-4 text-center h-100">
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

            <div className="d-flex justify-content-center gap-3 mb-3">
              {/* CHECK IN */}
              <div
                onClick={!todayAttendance?.checkIn ? handleCheckIn : null}
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  background: todayAttendance?.checkIn ? "#adb5bd" : "#28a745",
                  color: "white",
                  cursor: todayAttendance?.checkIn ? "not-allowed" : "pointer",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: "32px" }}>𖦹</span>
                <small style={{ fontSize: "10px" }}>In</small>
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
                  width: "80px",
                  height: "80px",
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
                <span style={{ fontSize: "32px" }}>𖦹</span>
                <small style={{ fontSize: "10px" }}>Out</small>
              </div>
            </div>

            <div className="small text-muted text-start">
              <div className="d-flex justify-content-between">
                <span>Check In</span>
                <span className="fw-semibold">
                  {todayAttendance?.checkIn
                    ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                    : "--"}
                </span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Check Out</span>
                <span className="fw-semibold">
                  {todayAttendance?.checkOut
                    ? new Date(todayAttendance.checkOut).toLocaleTimeString()
                    : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MONTHLY STATS */}
        <div className="col-12 col-md-4" style={{ minHeight: "200px" }}>
          <div className="bg-white shadow-sm rounded-4 p-4 h-100">
            <small className="fw-bold d-block mb-3">Monthly Stats</small>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Working Hours</span>
                {monthlyHours.toFixed(1)}h ({percent.toFixed(0)}%)
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Late</span>
                <span className="badge bg-warning text-dark px-3 py-2">
                  {monthly?.lateDays || 0}
                </span>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Absent</span>
                <span className="badge bg-danger px-3 py-2">
                  {monthly?.absentDays || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LEAVE REQUESTS */}
        <div className="col-12 col-md-4" style={{ minHeight: "200px" }}>
          <div className="bg-white shadow-sm rounded-4 p-4 h-100">
            <small className="fw-bold d-block mb-3">Leave Requests</small>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Pending</span>
                <span className="badge bg-warning text-dark px-3 py-2">
                  {leaveStats.pending}
                </span>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Approved</span>
                <span className="badge bg-success px-3 py-2">
                  {leaveStats.approved}
                </span>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Rejected</span>
                <span className="badge bg-danger px-3 py-2">
                  {leaveStats.rejected}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PAYROLL */}
        <div className="col-12 col-md-4" style={{ minHeight: "200px" }}>
          <div className="bg-white shadow-sm rounded-4 p-4 h-100">
            <small className="fw-bold d-block mb-3">This Month Payroll</small>

            {payroll ? (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Net Salary</span>

                  <span className="fw-bold text-success">
                    ${payroll.netSalary}
                  </span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Bonus</span>

                  <span className="badge bg-success px-3 py-2">
                    ${payroll.bonus}
                  </span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Deductions</span>

                  <span className="badge bg-danger px-3 py-2">
                    ${payroll.deductions}
                  </span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Status</span>

                  <span
                    className={`badge px-3 py-2 ${
                      payroll.status === "paid"
                        ? "bg-success"
                        : payroll.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                    }`}
                  >
                    {payroll.status}
                  </span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Month</span>

                  <span className="fw-semibold">{payroll.month}</span>
                </div>
              </div>
            ) : (
              <div className="text-muted text-center py-4">
                No payroll for this month
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTIVITY */}
        <div className="col-12 col-md-4" style={{ minHeight: "200px" }}>
          <div className="bg-white shadow-sm rounded-4 p-4 h-100">
            <small className="fw-bold d-block mb-4">Monthly Productivity</small>

            <div className="d-flex flex-column align-items-center">
              {/* CIRCLE */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "170px",
                  height: "170px",
                  background: `conic-gradient(
            #22c55e ${percent}%,
            #e5e7eb ${percent}%
          )`,
                }}
              >
                <div
                  className="bg-white rounded-circle d-flex flex-column align-items-center justify-content-center"
                  style={{
                    width: "130px",
                    height: "130px",
                  }}
                >
                  <h2 className="fw-bold mb-0">{percent.toFixed(0)}%</h2>

                  <small className="text-muted">
                    {monthlyHours.toFixed(1)}h / 160h
                  </small>
                </div>
              </div>

              {/* STATUS */}
              <div
                className="px-4 py-2 rounded-pill fw-semibold"
                style={{
                  background:
                    percent >= 80
                      ? "#dcfce7"
                      : percent >= 50
                        ? "#fef9c3"
                        : "#fee2e2",

                  color:
                    percent >= 80
                      ? "#15803d"
                      : percent >= 50
                        ? "#a16207"
                        : "#dc2626",
                }}
              >
                {percent >= 80
                  ? "Excellent Attendance"
                  : percent >= 50
                    ? "Good Progress"
                    : "Needs Improvement"}
              </div>
            </div>
          </div>
        </div>

        {/* MY PROFILE CARD */}
        <div className="col-12 col-md-4" style={{ minHeight: "200px" }}>
          <div
            onClick={() => router.push("/dashboard/myProfile")}
            className="bg-white shadow-sm rounded-4 p-4 h-100 d-flex flex-column justify-content-between"
            style={{
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            <div>
              <small className="fw-bold d-block mb-3">My Profile</small>

              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                View your personal information, department, salary details, and
                account data.
              </p>
            </div>

            <div className="text-center mt-4">
              <img
                src="/image.png"
                alt="profile"
                className="img-fluid"
                style={{
                  maxHeight: "160px",
                  objectFit: "contain",
                }}
              />
            </div>

            <button className="btn btn-dark rounded-pill mt-3">
              Open Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
