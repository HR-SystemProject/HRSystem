"use client";

import { useEffect, useState } from "react";
import { getEmployeePayroll } from "@/services/payroll";
import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";

import {
  FaMoneyBillWave,
  FaGift,
  FaArrowDown,
  FaCheckCircle,
  FaBuilding,
  FaUserTie,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MyPayrollPage() {
  const router = useRouter();

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const role = getRole();

  const roleName =
    typeof role === "string"
      ? role
      : role?.roleName || role?.role?.roleName;

  if (!roleName) {
    router.replace("/unauthorized");
    return;
  }

  if (!["admin", "hr"].includes(roleName)) {
    router.replace("/unauthorized");
  }
}, []);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await getEmployeePayroll();
      setPayrolls(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const latestPayroll = payrolls[0];

  const chartData = payrolls
    .slice()
    .map((item) => ({
      month: item.month,
      salary: item.netSalary,
    }));

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5>Loading payroll data...</h5>
      </div>
    );
  }

  return (
    <div
      className="container-fluid py-4"
      style={{ background: "#f8fafc", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back 👋</h2>

        <p className="text-muted">Here’s your payroll and salary overview</p>
      </div>

      {/* EMPTY STATE */}
      {payrolls.length === 0 ? (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center">
          <h4>💸 No Payroll Records Yet</h4>

          <p className="text-muted mt-2">
            Your payroll details will appear here once processed.
          </p>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="row g-4 mb-4">
            {/* NET SALARY */}
            <div className="col-md-3">
              <div
                className="p-4 rounded-4 shadow-sm h-100"
                style={{
                  background: "linear-gradient(135deg,#dcfce7,#86efac)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 fw-semibold text-muted">Net Salary</p>

                    <h3 className="fw-bold">${latestPayroll?.netSalary}</h3>
                  </div>

                  <FaMoneyBillWave size={30} color="#15803d" />
                </div>
              </div>
            </div>

            {/* BONUS */}
            <div className="col-md-3">
              <div
                className="p-4 rounded-4 shadow-sm h-100"
                style={{
                  background: "linear-gradient(135deg,#dbeafe,#93c5fd)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 fw-semibold text-muted">Bonus</p>

                    <h3 className="fw-bold">${latestPayroll?.bonus}</h3>
                  </div>

                  <FaGift size={28} color="#1d4ed8" />
                </div>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div className="col-md-3">
              <div
                className="p-4 rounded-4 shadow-sm h-100"
                style={{
                  background: "linear-gradient(135deg,#fee2e2,#fca5a5)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 fw-semibold text-muted">Deductions</p>

                    <h3 className="fw-bold">${latestPayroll?.deductions}</h3>
                  </div>

                  <FaArrowDown size={28} color="#dc2626" />
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="col-md-3">
              <div
                className="p-4 rounded-4 shadow-sm h-100"
                style={{
                  background: "linear-gradient(135deg,#fef9c3,#fde68a)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 fw-semibold text-muted">Status</p>

                    <h4 className="fw-bold text-capitalize">
                      {latestPayroll?.status}
                    </h4>
                  </div>

                  <FaCheckCircle size={28} color="#ca8a04" />
                </div>
              </div>
            </div>
          </div>

          {/* CHART + EMPLOYEE INFO */}
          <div className="row g-4 mb-4">
            {/* CHART */}
            <div className="col-lg-8">
              <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                <div className="mb-3">
                  <h5 className="fw-bold">Salary Overview</h5>

                  <p className="text-muted small">
                    Net salary history by month
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="salary"
                      stroke="#22c55e"
                      fill="#86efac"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* EMPLOYEE INFO */}
            <div className="col-lg-4">
              <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                <h5 className="fw-bold mb-4">Employee Information</h5>

                <div className="d-flex align-items-center mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "60px",
                      height: "60px",
                      background: "#dcfce7",
                    }}
                  >
                    <FaUserTie size={28} color="#15803d" />
                  </div>

                  <div className="ms-3">
                    <h6 className="mb-1 fw-bold">
                      {latestPayroll?.employeeId?.userId?.name}
                    </h6>

                    <small className="text-muted">
                      {latestPayroll?.employeeId?.jobTitle}
                    </small>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Email</small>

                  <span className="fw-semibold">
                    {latestPayroll?.employeeId?.userId?.email}
                  </span>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Department</small>

                  <span className="fw-semibold">
                    {latestPayroll?.employeeId?.departmentId?.name}
                  </span>
                </div>

                <div>
                  <small className="text-muted d-block">
                    Current Payroll Month
                  </small>

                  <span className="fw-semibold">{latestPayroll?.month}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PAYROLL HISTORY */}
          <div className="bg-white rounded-4 shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1">Payroll History</h5>

                <p className="text-muted small mb-0">
                  Your salary records and payment history
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Base Salary</th>
                    <th>Bonus</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id}>
                      <td className="fw-semibold">{payroll.month}</td>

                      <td>${payroll.baseSalary}</td>

                      <td className="text-primary fw-semibold">
                        ${payroll.bonus}
                      </td>

                      <td className="text-danger fw-semibold">
                        ${payroll.deductions}
                      </td>

                      <td className="fw-bold text-success">
                        ${payroll.netSalary}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            payroll.status === "paid"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
