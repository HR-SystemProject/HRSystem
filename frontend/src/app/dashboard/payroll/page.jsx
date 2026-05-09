"use client";
import { useState, useEffect } from "react";
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  updatePayrollStatus,
} from "../../../services/payroll";
import { useRouter } from "next/navigation";
import { getRole } from "../../../utils/auth";
import { getEmployees } from "../../../services/employees";
import { FaEdit, FaEye, FaPlus } from "react-icons/fa";

export default function Page() {
  const router = useRouter();

  const [errors, setErrors] = useState({});
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editPayroll, setEditPayroll] = useState(null);
  const [deletePayrollId, setDeletePayrollId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    bonus: "",
    deductions: "",
    paymentDate: "",
  });
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      employeeId: "",
      month: "",
      bonus: "",
      deductions: "",
      paymentDate: "",
    });
    setErrors({});
  };

  useEffect(() => { 
    const role = getRole();
    if (!role || !["admin", "hr"].includes(role.roleName)) {
      router.push("/unauthorized");
    }
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await getPayrolls();
      setPayrolls(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.employeeId) newErrors.employeeId = "Employee is required";

    if (!formData.month.trim()) newErrors.month = "Month is required";
    else if (!/^\d{4}-\d{2}$/.test(formData.month))
      newErrors.month = "Month must be in YYYY-MM format";

    if (formData.bonus < 0) newErrors.bonus = "Bonus must be 0 or more";

    if (formData.deductions < 0)
      newErrors.deductions = "Deductions must be 0 or more";

    if (formData.paymentDate) {
      const today = new Date();
      const selected = new Date(formData.paymentDate);

      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      if (selected < today) {
        newErrors.paymentDate = "Payment date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEdit = () => {
    let newErrors = {};

    if (editPayroll.bonus < 0) newErrors.bonus = "Bonus must be 0 or more";

    if (editPayroll.deductions < 0)
      newErrors.deductions = "Deductions must be 0 or more";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPayroll = async () => {
    if (!validate()) return;

    try {
      const emp = employees.find((e) => e._id === formData.employeeId);

      const payload = {
        employeeId: formData.employeeId,
        month: formData.month,
        bonus: Number(formData.bonus || 0),
        deductions: Number(formData.deductions || 0),
        paymentDate: formData.paymentDate || null,
      };

      await createPayroll(payload);
      fetchPayrolls();
      closeModal();
    } catch (err) {
      const message = err?.response?.data?.message;

      setErrors((prev) => ({
        ...prev,
        api: message || "Something went wrong",
      }));
    }
  };

  const handleEditPayroll = (payroll) => {
    setEditPayroll({
      ...payroll,
      baseSalary: payroll.employeeId?.salary,
      bonus: payroll.bonus,
      deductions: payroll.deductions,
    });
  };

  const handleEditChange = (e) => {
    setEditPayroll({ ...editPayroll, [e.target.name]: e.target.value });
  };

  const handleUpdatePayroll = async () => {
    if (!validateEdit()) return;
    try {
      const payload = {
        baseSalary: Number(editPayroll.baseSalary),
        bonus: Number(editPayroll.bonus || 0),
        deductions: Number(editPayroll.deductions || 0),
      };
      await updatePayroll(editPayroll._id, payload);
      setEditPayroll(null);
      setErrors({});
      await fetchPayrolls();
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleStatus = async (payroll) => {
    try {
      const newStatus = payroll.status === "pending" ? "paid" : "pending";

      await updatePayrollStatus(payroll._id, newStatus);
      await fetchPayrolls();
    } catch (err) {
      console.log(err);
    }
  };

  const getEmployeeName = (payroll) => {
    return payroll?.employeeId?.userId?.name || "Unknown";
  };

  const getEmployeeDept = (payroll) => {
    return payroll?.employeeId?.departmentId?.name || "—";
  };

  const isLocked = (payroll) => payroll.status === "paid";

  const filteredPayrolls = payrolls
    .filter((p) =>
      getEmployeeName(p).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter));

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold">💰 Payroll Management</h3>
          <small className="text-muted">
            Manage employee salaries, bonuses, and deductions efficiently while
            keeping payroll records accurate and up to date.
          </small>
        </div>
        <button
          onClick={openModal}
          className="btn btn-success d-flex align-items-center gap-2"
        >
          <FaPlus size={14} />
          Add Payroll
        </button>
      </div>

      <div className="d-flex justify-content-center align-items-center gap-3 mb-3 flex-wrap">
        {/* Search */}
        <input
          type="text"
          className="form-control w-25"
          
          placeholder="Search ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Filter */}
        <div className="d-flex align-items-center gap-2 w-25">
          <select
            className="form-select form-select-sm "
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* View Payroll Modal */}
      {selectedPayroll && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Payroll Details</h5>
              <button
                className="btn-close"
                onClick={() => setSelectedPayroll(null)}
              />
            </div>

            {/* Employee */}
            <div className="mb-2">
              <strong>Employee:</strong> {getEmployeeName(selectedPayroll)}
            </div>

            {/* Department */}
            <div className="mb-2">
              <strong>Department:</strong> {getEmployeeDept(selectedPayroll)}
            </div>

            {/* Month */}
            <div className="mb-2">
              <strong>Month:</strong> {selectedPayroll.month}
            </div>

            {/* Salary */}
            <div className="mb-2">
              <strong>Base Salary:</strong> $
              {selectedPayroll.employeeId?.salary || 0}
            </div>

            {/* Bonus */}
            <div className="mb-2">
              <strong>Bonus:</strong> ${selectedPayroll.bonus || 0}
            </div>

            {/* Deductions */}
            <div className="mb-2">
              <strong>Deductions:</strong> ${selectedPayroll.deductions || 0}
            </div>

            {/* Net Salary */}
            <div className="mb-2">
              <strong>Net Salary:</strong>{" "}
              <span className="fw-bold text-success">
                ${selectedPayroll.netSalary}
              </span>
            </div>

            <div className="mb-3 d-flex align-items-center gap-2">
              <strong>Status:</strong>
              <span
                className={`badge px-3 py-2 ${
                  selectedPayroll.status === "paid"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {selectedPayroll.status}
              </span>
            </div>

            {/* Payment Date */}
            {selectedPayroll.paymentDate && (
              <div className="mb-2">
                <strong>Payment Date:</strong>{" "}
                {new Date(selectedPayroll.paymentDate).toLocaleDateString()}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-muted small mt-3">
              <div>
                Created:{" "}
                {new Date(selectedPayroll.createdAt).toLocaleDateString()}
              </div>
              <div>
                Updated:{" "}
                {new Date(selectedPayroll.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payroll Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Create Payroll</h5>
              <button className="btn-close" onClick={closeModal} />
            </div>

            <select
              name="employeeId"
              className="form-control mb-2"
              onChange={(e) => {
                setFormData({ ...formData, employeeId: e.target.value });
              }}
              value={formData.employeeId}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.userId?.name || emp._id}
                </option>
              ))}
            </select>
            {errors.employeeId && (
              <small className="text-danger d-block mb-2">
                {errors.employeeId}
              </small>
            )}

            <input
              name="month"
              placeholder="Month (YYYY-MM)"
              className="form-control mb-2"
              onChange={handleChange}
              value={formData.month}
            />
            {errors.month && (
              <small className="text-danger d-block mb-2">{errors.month}</small>
            )}

            <input
              name="bonus"
              type="number"
              placeholder="Bonus (optional)"
              className="form-control mb-2"
              onChange={handleChange}
              value={formData.bonus}
            />

            <input
              name="deductions"
              type="number"
              placeholder="Deductions (optional)"
              className="form-control mb-2"
              onChange={handleChange}
              value={formData.deductions}
            />

            <input
              name="paymentDate"
              type="date"
              placeholder="Payment Date (optional)"
              className="form-control mb-3"
              onChange={handleChange}
              value={formData.paymentDate}
            />

            {errors.api && (
              <div className="alert alert-danger py-2 mb-2">{errors.api}</div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={handleAddPayroll}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {editPayroll && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Edit Payroll</h5>
              <button
                className="btn-close"
                onClick={() => setEditPayroll(null)}
              />
            </div>

            {/* Employee (readonly) */}
            <input
              className="form-control mb-2"
              value={getEmployeeName(editPayroll)}
              disabled
            />

            {/* Month (readonly) */}
            <input
              className="form-control mb-2"
              value={editPayroll.month}
              disabled
            />

            {/* Bonus */}
            <input
              name="bonus"
              type="number"
              className="form-control mb-2"
              placeholder="Bonus"
              value={editPayroll.bonus}
              onChange={handleEditChange}
            />
            {errors.bonus && (
              <small className="text-danger d-block mb-2">{errors.bonus}</small>
            )}

            {/* Deductions */}
            <input
              name="deductions"
              type="number"
              className="form-control mb-2"
              placeholder="Deductions"
              value={editPayroll.deductions}
              onChange={handleEditChange}
            />
            {errors.deductions && (
              <small className="text-danger d-block mb-2">
                {errors.deductions}
              </small>
            )}

            {/* Payment Date */}
            <input
              name="paymentDate"
              type="date"
              className="form-control mb-3"
              value={
                editPayroll.paymentDate
                  ? editPayroll.paymentDate.split("T")[0]
                  : ""
              }
              onChange={handleEditChange}
            />

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditPayroll(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-warning btn-sm"
                onClick={handleUpdatePayroll}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table align-middle">
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Month</th>
              <th>Base Salary</th>
              <th>Bonus</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayrolls.map((payroll) => (
              <tr key={payroll._id}>
                <td>{getEmployeeName(payroll)}</td>
                <td>{getEmployeeDept(payroll)}</td>
                <td>{payroll.month}</td>
                <td>${payroll.employeeId?.salary}</td>
                <td className="text-success fw-semibold">${payroll.bonus}</td>
                <td className="text-danger fw-semibold">
                  ${payroll.deductions}
                </td>
                <td className="fw-semibold text-success">
                  ${payroll.netSalary}
                </td>
                <td>
                  <span
                    onClick={() => handleToggleStatus(payroll)}
                    style={{ cursor: "pointer" }}
                    className={`fw-semibold ${
                      payroll.status === "paid"
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {payroll.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setSelectedPayroll(payroll)}
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-2"
                    >
                      <FaEye size={13} />
                    </button>

                    <>
                      <button
                        onClick={() => handleEditPayroll(payroll)}
                        disabled={payroll.status === "paid"}
                        className={`btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-2 ${
                          payroll.status === "paid" ? "opacity-50" : ""
                        }`}
                      >
                        <FaEdit size={13} />
                      </button>
                    </>
                  </div>
                </td>
              </tr>
            ))}

            {payrolls.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted py-4">
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
        {/* Prev */}
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {/* Pages */}
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

        {/* Next */}
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
