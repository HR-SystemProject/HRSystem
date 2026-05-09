"use client";
import React, { useState, useEffect } from "react";

import { getEmployees, getMyEmployee } from "../../../services/employees";
import { getUsers } from "../../../services/users";
import { getDepartments } from "../../../services/departments";
import {
  getAttendance,
  checkIn,
  checkOut,
  getMyTodayAttendance,
} from "../../../services/attendance";
import { getPayrolls } from "../../../services/payroll";
import { useRouter } from "next/navigation";
import { getRole } from "../../../utils/auth";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FaUsers,
  FaBuilding,
  FaUserTie,
  FaCalendarCheck,
  FaFileAlt,
  FaMoneyBill,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const role = getRole();
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAtt, setLoadingAtt] = useState(false);

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    if (!["admin", "hr"].includes(roleName)) {
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

  const COLORS = [
    "#22c55e",
    "#facc15",
    "#ef4444",
    "#3b82f6",
    "#a855f7",
    "#f97316",
    "#14b8a6",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const role = getRole();

        if (!role || !["admin", "hr"].includes(role.roleName)) {
          router.push("/unauthorized");
          return;
        }
        const empRes = await getEmployees();
        const userRes = await getUsers();
        const depRes = await getDepartments();

        setEmployees(empRes.data.data || []);
        setUsers(userRes.data.data || []);
        setDepartments(depRes.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const role = getRole();

    if (!role || !["admin", "hr"].includes(role.roleName)) {
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await getAttendance();
        setAttendance(res.data.data || []);
      } catch (error) {
        console.log("ERROR FULL:", error);
        console.log("MESSAGE:", error.message);
        console.log("RESPONSE:", error.response);
        console.log("DATA:", error.response?.data);
        console.log("STATUS:", error.response?.status);
        console.log("URL:", error.config?.url);
      }
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await getPayrolls();
        setPayrolls(res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPayrolls();
  }, []);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyPayroll = payrolls.filter((p) => p.month === currentMonth);

  const totalMonthlyPayroll = monthlyPayroll.reduce(
    (sum, p) => sum + (p.netSalary || 0),
    0,
  );
  const monthName = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Attendance chart
  const chartData = [
    {
      name: "Present",
      value: attendance.filter((a) => a.status === "present").length,
    },
    {
      name: "Late",
      value: attendance.filter((a) => a.status === "late").length,
    },
    {
      name: "Absent",
      value: attendance.filter((a) => a.status === "absent").length,
    },
  ];

  const departmentChartData = departments.map((dep) => {
    const count = employees.filter(
      (emp) => emp.departmentId?._id === dep._id,
    ).length;

    return {
      name: dep.name,
      employees: count,
    };
  });

  const totalEmployees = employees.length;
  const totalUsers = users.length;
  const totalDepartments = departments.length;

  const roleName =
    typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

  const allowed = ["admin", "hr"];

  return (
    <div className="container py-5">
      {/* TOP SECTION */}
      {/* TOP DASHBOARD SECTION */}
      <div className="row g-4 mb-4">
        {/* STATS CARDS */}
        <div className="col-lg-8">
          <div className="row g-3">
            <div className="col-md-6">
              <div
                className="p-3 shadow-sm rounded text-center transition-card"
                style={{
                  background: "linear-gradient(135deg, #d9ffea, #a8f0c6)",
                  color: "#116336",
                  fontWeight: "bold",
                }}
              >
                <h6>Total Employees</h6>
                <h4>{totalEmployees}</h4>
              </div>
            </div>

            <div className="col-md-6">
              <div
                className="p-3 shadow-sm rounded text-center transition-card"
                style={{
                  background: "linear-gradient(135deg, #d9daff, #b3b7ff)",
                  color: "#201163",
                  fontWeight: "bold",
                }}
              >
                <h6>Total Users</h6>
                <h4>{totalUsers}</h4>
              </div>
            </div>

            <div className="col-md-6">
              <div
                className="p-3 shadow-sm rounded text-center transition-card"
                style={{
                  background: "linear-gradient(135deg, #ffdcd9, #ffb3ad)",
                  color: "#8f3714",
                  fontWeight: "bold",
                }}
              >
                <h6>Departments</h6>
                <h4>{totalDepartments}</h4>
              </div>
            </div>

            <div className="col-md-6">
              <div
                className="p-3 shadow-sm rounded text-center transition-card"
                style={{
                  background: "linear-gradient(135deg, #fff3cd, #ffd966)",
                  color: "#7a5a00",
                  fontWeight: "bold",
                }}
              >
                <h6>Payroll - {monthName}</h6>
                <h4>${totalMonthlyPayroll}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE CARD */}
        <div className="col-lg-4">
          <div className="bg-white shadow-sm rounded-4 p-0 h-100 text-center">
            <small className="fw-bold d-block mb-3">Today Attendance</small>

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

            {/* BIG BUTTONS */}
            <div className="d-flex justify-content-center gap-3 mb-3">
              <div
                onClick={!todayAttendance?.checkIn ? handleCheckIn : null}
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  background: todayAttendance?.checkIn ? "#adb5bd" : "#28a745",
                  color: "white",
                  cursor: todayAttendance?.checkIn ? "not-allowed" : "pointer",
                }}
              >
                IN
              </div>

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
                  background: todayAttendance?.checkOut
                    ? "#dc3545"
                    : todayAttendance?.checkIn
                      ? "#ffc107"
                      : "#adb5bd",
                  color: "white",
                  cursor:
                    todayAttendance?.checkIn && !todayAttendance?.checkOut
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                OUT
              </div>
            </div>

            {/* TIMES */}
            <div className="small text-muted">
              <div>
                <b>Check In:</b>{" "}
                {todayAttendance?.checkIn
                  ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                  : "--"}
              </div>

              <div>
                <b>Check Out:</b>{" "}
                {todayAttendance?.checkOut
                  ? new Date(todayAttendance.checkOut).toLocaleTimeString()
                  : "--"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 justify-content-center">
        {/* Attendance */}
        <div className="col-12 col-md-12 col-lg-6">
          <div className="shadow-sm p-4 rounded bg-white h-100">
            <h6 className="fw-semibold">Monthly Attendance Distribution</h6>
            <p className="text-muted mb-3" style={{ fontSize: "12px" }}>
              Overview of employee attendance (Present, Late, Absent)
            </p>

            <div className="d-flex justify-content-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={65}
                  paddingAngle={3}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="col-md-6">
          <div className="shadow-sm p-4 rounded bg-white h-100">
            <h6 className="fw-semibold">
              Employees Distribution by Department
            </h6>
            <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
              Number of employees in each department
            </p>

            <BarChart width={450} height={400} data={departmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
                height={100}
              />
              <YAxis />
              <Tooltip />

              <Bar dataKey="employees" radius={[8, 8, 0, 0]}>
                {departmentChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-5">
        <h6 className="fw-semibold mb-3">⚡ Quick Actions</h6>

        <div className="row g-3">
          {/* Employees */}
          {roleName === "admin" && (
            <div className="col-6 col-md-4 col-lg-2">
              <div
                onClick={() => router.push("/dashboard/employees")}
                className="p-3 text-center shadow-sm rounded quick-card"
                style={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#d9ffea,#a8f0c6)",
                }}
              >
                <FaUserTie size={22} />
                <div className="mt-2 fw-semibold">Add new Employees</div>
              </div>
            </div>
          )}

          {/* Departments */}
          <div className="col-6 col-md-4 col-lg-2">
            <div
              onClick={() => router.push("/dashboard/departments")}
              className="p-3 text-center shadow-sm rounded quick-card"
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg,#d9daff,#b3b7ff)",
              }}
            >
              <FaBuilding size={22} />
              <div className="mt-2 fw-semibold">Add new Departments</div>
            </div>
          </div>

          {/* Users */}
          {role?.roleName === "admin" && (
            <div className="col-6 col-md-4 col-lg-2">
              <div
                onClick={() => router.push("/dashboard/users")}
                className="p-3 text-center shadow-sm rounded quick-card"
                style={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#ffe3f0,#ffb3d9)",
                }}
              >
                <FaUsers size={22} />
                <div className="mt-2 fw-semibold">Add new Users</div>
              </div>
            </div>
          )}

          {/* Attendance */}
          <div className="col-6 col-md-4 col-lg-2">
            <div
              onClick={() => router.push("/dashboard/attendance")}
              className="p-3 text-center shadow-sm rounded quick-card"
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg,#fff3cd,#ffd966)",
              }}
            >
              <FaCalendarCheck size={22} />
              <div className="mt-2 fw-semibold">Show Attendance </div>
            </div>
          </div>

          {/* Leaves */}
          <div className="col-6 col-md-4 col-lg-2">
            <div
              onClick={() => router.push("/dashboard/leaveRequests")}
              className="p-3 text-center shadow-sm rounded quick-card"
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg,#ffd6d6,#ff8a8a)",
              }}
            >
              <FaFileAlt size={22} />
              <div className="mt-2 fw-semibold">Details Leave Requests</div>
            </div>
          </div>

          {/* Payroll 💰 */}
          <div className="col-6 col-md-4 col-lg-2">
            <div
              onClick={() => router.push("/dashboard/payroll")}
              className="p-3 text-center shadow-sm rounded quick-card"
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg,#e0f2ff,#7cc7ff)",
              }}
            >
              <FaMoneyBill size={22} />
              <div className="mt-2 fw-semibold">Paid Payroll</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
