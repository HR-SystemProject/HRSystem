"use client";

import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../../services/employees";

import { getDepartments } from "../../../services/departments";

import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    jobTitle: "",
    salary: "",
    phone: "",
    departmentId: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- VALIDATION ----------------
  const validate = (data) => {
    let err = {};

    if (!data.jobTitle) err.jobTitle = "Job title is required";

    if (!data.departmentId) err.departmentId = "Department is required";

    if (!data.salary || data.salary <= 0)
      err.salary = "Salary must be greater than 0";

    return err;
  };

  // ---------------- CHANGE ----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------- CREATE ----------------
  const handleCreate = async () => {
    const err = validate(formData);
    setErrors(err);

    if (Object.keys(err).length > 0) return;

    try {
      await createEmployee(formData);
      setShowModal(false);
      setFormData({
        jobTitle: "",
        salary: "",
        phone: "",
        departmentId: "",
        status: "active",
      });
      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Employees</h3>

        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus />
          Add Employee
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-3">
        {employees.map((emp) => (
          <div key={emp._id} className="col-md-4">
            <div className="card transition-card shadow-sm p-3">

              <h5 className="fw-bold">{emp.jobTitle}</h5>

              <p className="mb-1">Salary: {emp.salary}</p>
              <p className="mb-1">Phone: {emp.phone}</p>
              <p className="mb-1">
                Department: {emp.departmentId?.name}
              </p>

              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setEditEmployee(emp)}
                >
                  <FaEdit />
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setDeleteId(emp._id)}
                >
                  <FaTrash />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ---------------- CREATE MODAL ---------------- */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
        >
          <div className="bg-white p-4 rounded shadow transition-card"
            style={{ width: "500px", maxWidth: "95%" }}
          >

            <h5 className="fw-bold mb-3">Create Employee</h5>

            <input
              name="jobTitle"
              placeholder="Job Title"
              className="form-control mb-2"
              onChange={handleChange}
            />
            {errors.jobTitle && <small className="text-danger">{errors.jobTitle}</small>}

            <input
              name="salary"
              type="number"
              placeholder="Salary"
              className="form-control mb-2"
              onChange={handleChange}
            />
            {errors.salary && <small className="text-danger">{errors.salary}</small>}

            <input
              name="phone"
              placeholder="Phone"
              className="form-control mb-2"
              onChange={handleChange}
            />

            {/* Department Dropdown */}
            <select
              name="departmentId"
              className="form-select mb-2"
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <small className="text-danger">{errors.departmentId}</small>
            )}

            {/* Status */}
            <select
              name="status"
              className="form-select mb-3"
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- DELETE MODAL ---------------- */}
      {deleteId && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white p-4 rounded shadow">

            <h5>Are you sure?</h5>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}