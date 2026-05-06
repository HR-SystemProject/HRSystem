"use client";
import React, { useState, useEffect } from "react";
import { getEmployees } from "../../../services/employees";
import { getUsers } from "../../../services/users";
import { getDepartments } from "../../../services/departments";
import { getAllAttendance } from "../../../services/attendance";
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

export default function AdminDashboard() {
  const role = getRole();

  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);

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

        console.log("ROLE FROM TOKEN:", role);

        if (!role || !["admin", "hr"].includes(role.roleName)) {
          router.push("/unauthorized");
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
    const fetchAttendance = async () => {
      try {
        const res = await getAllAttendance();
        setAttendance(res.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAttendance();
  }, []);

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

  // Employees per department
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
      {/* Cards */}
      <div className="row g-3 mb-4 justify-content-center">
        <div className="col-md-3">
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

        <div className="col-md-3">
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

        <div className="col-md-3">
          <div
            className="p-3 shadow-sm rounded text-center transition-card"
            style={{
              background: "linear-gradient(135deg, #ffdcd9, #ffb3ad)",
              color: "#8f3714",
              fontWeight: "bold",
            }}
          >
            <h6>Total Departments</h6>
            <h4>{totalDepartments}</h4>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4">
        {/* Attendance */}
        <div className="col-md-6">
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
            <div className="col-md-2">
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
          <div className="col-md-2">
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
          <div className="col-md-2">
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

          {/* Attendance */}
          <div className="col-md-2">
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
          <div className="col-md-2">
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
          <div className="col-md-2">
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
