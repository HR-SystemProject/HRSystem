"use client";
import { useState, useEffect } from "react";
import {
  getPayrolls,
  getMyPayroll,
  createPayroll,
  updatePayroll,
  updatePayrollStatus,
} from "../../../services/payroll";
import { getEmployees } from "../../../services/employees";
import { getRole } from "../../../utils/auth";
import { FaEdit, FaTrash, FaEye, FaPlus, FaMoneyBillWave } from "react-icons/fa";

export default function Page() {
  const [errors, setErrors] = useState({});
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editPayroll, setEditPayroll] = useState(null);
  const [deletePayrollId, setDeletePayrollId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    baseSalary: "",
    bonus: "",
    deductions: "",
    paymentDate: "",
  });

  const role = getRole();
  const isAdminOrHR = role === "admin" || role === "hr";

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      employeeId: "",
      month: "",
      baseSalary: "",
      bonus: "",
      deductions: "",
      paymentDate: "",
    });
    setErrors({});
  };

  useEffect(() => {
    fetchPayrolls();
    if (isAdminOrHR) {
      fetchEmployees();
    }
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = isAdminOrHR
        ? await getPayrolls()
        : await getMyPayroll();
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
    if (!formData.baseSalary) newErrors.baseSalary = "Base salary is required";
    else if (isNaN(formData.baseSalary) || Number(formData.baseSalary) < 0)
      newErrors.baseSalary = "Base salary must be a positive number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEdit = () => {
    let newErrors = {};
    if (!editPayroll.baseSalary)
      newErrors.baseSalary = "Base salary is required";
    else if (isNaN(editPayroll.baseSalary) || Number(editPayroll.baseSalary) < 0)
      newErrors.baseSalary = "Base salary must be a positive number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPayroll = async () => {
    if (!validate()) return;
    try {
      const payload = {
        employeeId: formData.employeeId,
        month: formData.month,
        baseSalary: Number(formData.baseSalary),
        bonus: Number(formData.bonus || 0),
        deductions: Number(formData.deductions || 0),
        paymentDate: formData.paymentDate || null,
      };
      await createPayroll(payload);
      closeModal();
      await fetchPayrolls();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditPayroll = (payroll) => {
    setEditPayroll({
      ...payroll,
      baseSalary: payroll.baseSalary,
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

  const openDelete = (id) => setDeletePayrollId(id);
  const closeDelete = () => setDeletePayrollId(null);

  const handleDeletePayroll = async () => {
    try {
     
      setDeletePayrollId(null);
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

  return (
    <div className="container py-5">
      <div className="d-flex flex-column align-items-start mb-4 gap-2">
        <h3 className="fw-bold m-0">Payroll Management</h3>

        {isAdminOrHR && (
          <button
            onClick={openModal}
            className="btn btn-success d-flex align-items-center gap-2"
          >
            <FaPlus size={14} />
            Add Payroll
          </button>
        )}
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Payroll Details</h5>
              <button
                className="btn-close"
                onClick={() => setSelectedPayroll(null)}
              />
            </div>

            <div className="mb-2">
              <strong>Employee:</strong> {getEmployeeName(selectedPayroll)}
            </div>
            <div className="mb-2">
              <strong>Department:</strong> {getEmployeeDept(selectedPayroll)}
            </div>
            <div className="mb-2">
              <strong>Month:</strong> {selectedPayroll.month}
            </div>
            <div className="mb-2">
              <strong>Base Salary:</strong> ${selectedPayroll.baseSalary}
            </div>
            <div className="mb-2">
              <strong>Bonus:</strong> ${selectedPayroll.bonus}
            </div>
            <div className="mb-2">
              <strong>Deductions:</strong> ${selectedPayroll.deductions}
            </div>
            <div className="mb-2">
              <strong>Net Salary:</strong>{" "}
              <span className="text-success fw-semibold">
                ${selectedPayroll.netSalary}
              </span>
            </div>
            <div className="mb-2">
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  selectedPayroll.status === "paid" ? "bg-success" : "bg-warning text-dark"
                }`}
              >
                {selectedPayroll.status}
              </span>
            </div>
            {selectedPayroll.paymentDate && (
              <div className="mb-2">
                <strong>Payment Date:</strong>{" "}
                {new Date(selectedPayroll.paymentDate).toLocaleDateString()}
              </div>
            )}
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
              onChange={handleChange}
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
              <small className="text-danger d-block mb-2">{errors.employeeId}</small>
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
              name="baseSalary"
              type="number"
              placeholder="Base Salary"
              className="form-control mb-2"
              onChange={handleChange}
              value={formData.baseSalary}
            />
            {errors.baseSalary && (
              <small className="text-danger d-block mb-2">{errors.baseSalary}</small>
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
              <button className="btn-close" onClick={() => setEditPayroll(null)} />
            </div>

            <input
              name="baseSalary"
              type="number"
              className="form-control mb-2"
              value={editPayroll.baseSalary}
              onChange={handleEditChange}
              placeholder="Base Salary"
            />
            {errors.baseSalary && (
              <small className="text-danger d-block mb-2">{errors.baseSalary}</small>
            )}

            <input
              name="bonus"
              type="number"
              className="form-control mb-2"
              value={editPayroll.bonus}
              onChange={handleEditChange}
              placeholder="Bonus"
            />

            <input
              name="deductions"
              type="number"
              className="form-control mb-3"
              value={editPayroll.deductions}
              onChange={handleEditChange}
              placeholder="Deductions"
            />

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

      {/* Delete Confirmation Modal */}
      {deletePayrollId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "350px" }}
          >
            <h5 className="mb-3">Confirm Delete</h5>
            <p>Are you sure you want to delete this payroll record?</p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={closeDelete}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3"
                onClick={handleDeletePayroll}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
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
            {payrolls.map((payroll) => (
              <tr key={payroll._id}>
                <td>{getEmployeeName(payroll)}</td>
                <td>{getEmployeeDept(payroll)}</td>
                <td>{payroll.month}</td>
                <td>${payroll.baseSalary}</td>
                <td>${payroll.bonus}</td>
                <td>${payroll.deductions}</td>
                <td className="fw-semibold text-success">${payroll.netSalary}</td>
                <td>
                  <span
                    className={`badge ${
                      payroll.status === "paid"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {payroll.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setSelectedPayroll(payroll)}
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-2"
                    >
                      <FaEye size={13} /> View
                    </button>

                    {isAdminOrHR && (
                      <>
                        <button
                          onClick={() => handleEditPayroll(payroll)}
                          className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-2"
                        >
                          <FaEdit size={13} /> Edit
                        </button>

                        <button
                          onClick={() => handleToggleStatus(payroll)}
                          className={`btn btn-sm d-flex align-items-center gap-1 px-2 ${
                            payroll.status === "pending"
                              ? "btn-outline-success"
                              : "btn-outline-secondary"
                          }`}
                        >
                          <FaMoneyBillWave size={13} />
                          {payroll.status === "pending" ? "Mark Paid" : "Mark Pending"}
                        </button>

                        <button
                          onClick={() => openDelete(payroll._id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <FaTrash size={13} />
                        </button>
                      </>
                    )}
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
    </div>
  );
}
