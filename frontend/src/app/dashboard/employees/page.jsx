"use client";

import { useState, useEffect } from "react";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../../services/employees";

import { getDepartments } from "../../../services/departments";

import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    departmentId: "",
    jobTitle: "",
    salary: "",
    hireDate: "",
    phone: "",
    address: "",
    status: "active",
  });

  //  FETCH 
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

  //  VALIDATION 
  const validate = (data) => {
    let err = {};

    if (!data.departmentId) err.departmentId = "Department is required";
    if (!data.jobTitle) err.jobTitle = "Job title is required";

    if (data.salary !== "" && data.salary < 0) {
      err.salary = "Salary must be positive number";
    }

    return err;
  };

  //  HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  CREATE
  const handleCreate = async () => {
    const err = validate(formData);
    setErrors(err);

    if (Object.keys(err).length > 0) return;

    try {
      await createEmployee({
        ...formData,
        salary: Number(formData.salary),
      });

      setShowModal(false);
      setFormData({
        departmentId: "",
        jobTitle: "",
        salary: "",
        hireDate: "",
        phone: "",
        address: "",
        status: "active",
      });

      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  //  DELETE
  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  // VIEW 
  const handleView = async (id) => {
    try {
      const res = await getEmployeeById(id);
      setSelectedEmployee(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    const err = validate(editEmployee);
    setErrors(err);

    if (Object.keys(err).length > 0) return;

    try {
      await updateEmployee(editEmployee._id, {
        ...editEmployee,
        salary: Number(editEmployee.salary),
      });

      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h3>Employees</h3>

        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Employee
        </button>
      </div>

      {/* ================= CREATE MODAL ================= */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="bg-white p-4 rounded" style={{ width: "450px" }}>

            <h5>Create Employee</h5>

            {/* Department Dropdown */}
            <select
              name="departmentId"
              className="form-select mb-2"
              onChange={handleChange}
              value={formData.departmentId}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId && <small className="text-danger">{errors.departmentId}</small>}

            <input
              name="jobTitle"
              placeholder="Job Title"
              className="form-control my-2"
              onChange={handleChange}
              value={formData.jobTitle}
            />

            <input
              name="salary"
              type="number"
              placeholder="Salary"
              className="form-control my-2"
              onChange={handleChange}
              value={formData.salary}
            />
            {errors.salary && <small className="text-danger">{errors.salary}</small>}

            <input
              name="phone"
              placeholder="Phone"
              className="form-control my-2"
              onChange={handleChange}
              value={formData.phone}
            />

            <input
              name="address"
              placeholder="Address"
              className="form-control my-2"
              onChange={handleChange}
              value={formData.address}
            />

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleCreate}>
                Create
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="row g-3">
        {employees.map((emp) => (
          <div key={emp._id} className="col-md-6">

            <div className="card p-3 shadow-sm transition-card">

              <h5>{emp.jobTitle}</h5>

              <p className="mb-1">
                Department: {emp.departmentId?.name}
              </p>

              <p className="mb-2">
                Salary: {emp.salary}
              </p>

              <div className="d-flex gap-2">

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleView(emp._id)}
                >
                  <FaEye />
                </button>

                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => setEditEmployee(emp)}
                >
                  <FaEdit />
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setDeleteId(emp._id)}
                >
                  <FaTrash />
                </button>

              </div>

            </div>

          </div>
        ))}
      </div>

      {/* DELETE */}
      {deleteId && (
        <div className="modal-backdrop">
          <div className="bg-white p-4 rounded">
            <p>Are you sure?</p>
            <button className="btn btn-secondary me-2" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

    </div>
  );
}