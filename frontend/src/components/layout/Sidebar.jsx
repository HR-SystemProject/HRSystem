"use client";
import Link from "next/link";

export default function Sidebar({ role }) {
  const menu = {
    admin: [
      { name: "Dashboard", path: "/dashboard/dashboard" },
      { name: "Roles", path: "/dashboard/roles" },
      { name: "Users", path: "/dashboard/users" },
      { name: "Employees", path: "/dashboard/employees" },
      { name: "Departments", path: "/dashboard/departments" },
      { name: "Attendance", path: "/dashboard/attendance" },
      { name: "Leave Requests", path: "/dashboard/leaveRequests" },
      { name: "Payroll", path: "/dashboard/payroll" },
    ],

    hr: [
      { name: "Dashboard", path: "/dashboard/dashboard" },
      { name: "Employees", path: "/dashboard/employees" },
      { name: "Departments", path: "/dashboard/departments" },
      { name: "Attendance", path: "/dashboard/attendance" },
      { name: "Leave Requests", path: "/dashboard/leaveRequests" },
      { name: "Payroll", path: "/dashboard/payroll" },
    ],

    user: [
      { name: "Dashboard", path: "/dashboard/userDashboard" },
      { name: "My Profile", path: "/dashboard/myProfile" },
      { name: "My Attendance", path: "/dashboard/myAttendance" },
      { name: "My Leave Requests", path: "/dashboard/myLeaveRequests" },
      { name: "My Payroll", path: "/dashboard/myPayroll" },
    ],
  };
  const items = menu[role] || [];

  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: "300px" }}>
      <h2 className="font-bold my-5">HR System</h2>

      <ul className="nav flex-column">
        {items.map((item) => (
          <li className="nav-item my-2" key={item.name}>
            <Link href={item.path} className="nav-link text-light px-3 py-2">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
