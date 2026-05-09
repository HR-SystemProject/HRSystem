"use client";
import Link from "next/link";

export default function Sidebar({ role }) {
  const menu = [
    { name: "Dashboard", path: "/dashboard/dashboard", roles: ["admin", "hr"] },
    { name: "Dashboard", path: "/dashboard/userDashboard", roles: ["user"] },

    { name: "Roles", path: "/dashboard/roles", roles: ["admin"] },
    { name: "Users", path: "/dashboard/users", roles: ["admin"] },

    { name: "Employees", path: "/dashboard/employees", roles: ["admin", "hr"] },
    {
      name: "Departments",
      path: "/dashboard/departments",
      roles: ["admin", "hr"],
    },
    {
      name: "Attendance",
      path: "/dashboard/attendance",
      roles: ["admin", "hr"],
    },
    {
      name: "Leave Requests",
      path: "/dashboard/leaveRequests",
      roles: ["admin", "hr"],
    },
    { name: "Payroll", path: "/dashboard/payroll", roles: ["admin", "hr"] },

    {
      name: "My Profile",
      path: "/dashboard/myProfile",
      roles: ["admin", "hr", "user"],
    },
    {
      name: "My Attendance",
      path: "/dashboard/myAttendance",
      roles: ["admin", "hr", "user"],
    },
    {
      name: "My Leave Requests",
      path: "/dashboard/myLeaveRequests",
      roles: ["admin", "hr", "user"],
    },
    {
      name: "My Payroll",
      path: "/dashboard/myPayroll",
      roles: ["admin", "hr", "user"],
    },
  ];

  const items = menu.filter((item) => item.roles.includes(role));

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
