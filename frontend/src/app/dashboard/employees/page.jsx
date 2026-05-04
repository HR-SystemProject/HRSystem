"use client";

import { useState, useEffect } from "react";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../../services/employees";

import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    departmentId: "",
    jobTitle: "",
    salary: "",
    hireDate: "",
    phone: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE
  const handleCreate = async () => {
    try {
      await createEmployee(formData);
      setShowModal(false);
      setFormData({
        userId: "",
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

  // VIEW
  const handleView = async (id) => {
    try {
      const res = await getEmployeeById(id);
      setSelectedEmployee(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT
  const handleEditClick = (emp) => {
    setEditEmployee(emp);
  };

  const handleEditChange = (e) => {
    setEditEmployee({
      ...editEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateEmployee(editEmployee._id, editEmployee);
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Employees Management</h3>

        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Employee
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-3">
        {employees.map((emp) => (
          <div key={emp._id} className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <h5 className="fw-bold">
                  {emp.userId?.name}
                </h5>

                <p className="mb-1 text-muted">
                  {emp.jobTitle}
                </p>

                <p className="mb-1">
                  Department: {emp.departmentId?.name}
                </p>

                <p className="mb-3">
                  Status:{" "}
                  <span className="badge bg-secondary">
                    {emp.status}
                  </span>
                </p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleView(emp._id)}
                  >
                    <FaEye /> View
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => handleEditClick(emp)}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteId(emp._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-box">
            <h5>Create Employee</h5>

            <input
              name="userId"
              placeholder="User ID"
              className="form-control my-2"
              onChange={handleChange}
            />

            <input
              name="departmentId"
              placeholder="Department ID"
              className="form-control my-2"
              onChange={handleChange}
            />

            <input
              name="jobTitle"
              placeholder="Job Title"
              className="form-control my-2"
              onChange={handleChange}
            />

            <input
              name="salary"
              placeholder="Salary"
              className="form-control my-2"
              onChange={handleChange}
            />

            <input
              name="phone"
              placeholder="Phone"
              className="form-control my-2"
              onChange={handleChange}
            />

            <input
              name="address"
              placeholder="Address"
              className="form-control my-2"
              onChange={handleChange}
            />

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-success"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedEmployee && (
        <div className="modal-backdrop-custom">
          <div className="modal-box">
            <h5>{selectedEmployee.userId?.name}</h5>

            <p>Job Title: {selectedEmployee.jobTitle}</p>
            <p>Phone: {selectedEmployee.phone}</p>
            <p>Salary: {selectedEmployee.salary}</p>

            <button
              className="btn btn-secondary w-100"
              onClick={() => setSelectedEmployee(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editEmployee && (
        <div className="modal-backdrop-custom">
          <div className="modal-box">

            <h5>Edit Employee</h5>

            <input
              name="jobTitle"
              value={editEmployee.jobTitle}
              onChange={handleEditChange}
              className="form-control my-2"
            />

            <input
              name="salary"
              value={editEmployee.salary}
              onChange={handleEditChange}
              className="form-control my-2"
            />

            <button
              className="btn btn-warning w-100"
              onClick={handleUpdate}
            >
              Update
            </button>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal-backdrop-custom">
          <div className="modal-box">
            <h5>Are you sure?</h5>

            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary w-100"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger w-100"
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