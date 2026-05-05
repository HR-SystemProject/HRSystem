"use client";

import { useState, useEffect } from "react";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../../services/employees";

import { getUsers } from "../../../services/users";
import { getDepartments } from "../../../services/departments";

import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function EmployeesPage() {
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
    fetchUsers();
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

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data.data);
  };

  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
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

    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        salary: Number(formData.salary),
      };

      await createEmployee(payload);

      setShowModal(false);
      setErrors({});

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
      const message = err.response?.data?.message;

      if (message === "Employee already exists for this user") {
        setErrors({
          userId: "This user already has an employee record",
        });
      } else {
        console.log(err.response?.data || err.message);
      }
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
    if (!validateEdit()) return;

    try {
      const payload = {
        ...editEmployee,
        salary: Number(editEmployee.salary),
        departmentId:
          editEmployee.departmentId?._id || editEmployee.departmentId,
      };

      await updateEmployee(editEmployee._id, payload);

      setEditEmployee(null);
      setErrors({});
      fetchEmployees();
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Update failed",
      });
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

  const validate = () => {
    let newErrors = {};

    if (!formData.userId) newErrors.userId = "User is required";
    if (!formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(formData.salary)) {
      newErrors.salary = "Salary must be a number";
    } else if (Number(formData.salary) <= 0) {
      newErrors.salary = "Salary must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchValue = search.toLowerCase();

    const name = emp.userId?.name?.toLowerCase() || "";
    const email = emp.userId?.email?.toLowerCase() || "";
    const jobTitle = emp.jobTitle?.toLowerCase() || "";
    const department = emp.departmentId?.name?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      jobTitle.includes(searchValue) ||
      department.includes(searchValue);

    const matchesDepartment =
      departmentFilter === "all" || emp.departmentId?._id === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter]);

  const validateEdit = () => {
    let newErrors = {};

    if (!editEmployee.departmentId) {
      newErrors.departmentId = "Department is required";
    }

    if (!editEmployee.jobTitle) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!editEmployee.salary) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(editEmployee.salary)) {
      newErrors.salary = "Salary must be a number";
    } else if (Number(editEmployee.salary) <= 0) {
      newErrors.salary = "Salary must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold">👨‍💼 Employees Management</h3>
          <small className="text-muted">
            Manage and oversee your workforce efficiently
          </small>
        </div>

        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={openCreateModal}
        >
          <FaPlus /> Add Employee
        </button>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
        {/* SEARCH */}
        <input
          className="form-control w-25"
          placeholder="Search employee name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* DEPARTMENT FILTER */}
        <select
          className="form-select w-25"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.map((emp) => (
              <tr key={emp._id}>
                {/* NAME */}
                <td className="fw-semibold">{emp.userId?.name || "Unknown"}</td>

                {/* JOB TITLE */}
                <td>{emp.jobTitle}</td>

                {/* DEPARTMENT */}
                <td>{emp.departmentId?.name}</td>

                {/* SALARY */}
                <td>{emp.salary} JD</td>

                {/* STATUS */}
                <td>
                  <span
                    className={
                      emp.userId?.isActive ? "text-success" : "text-danger"
                    }
                  >
                    {emp.userId?.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {/* ACTIONS */}
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <FaEye size={13} /> View
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => setEditEmployee(emp)}
                  >
                    <FaEdit size={13} /> Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteId(emp._id)}
                  >
                    <FaTrash size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Create Employee</h5>

              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              />
            </div>

            {/* USER */}
            <select
              name="userId"
              className="form-select mb-2"
              onChange={handleChange}
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            {errors.userId && (
              <small className="text-danger">{errors.userId}</small>
            )}

            {/* DEPARTMENT */}
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

            {/* JOB TITLE */}
            <input
              name="jobTitle"
              placeholder="Job Title"
              className="form-control mb-2"
              onChange={handleChange}
            />
            {errors.jobTitle && (
              <small className="text-danger">{errors.jobTitle}</small>
            )}

            {/* SALARY */}
            <input
              name="salary"
              placeholder="Salary"
              className="form-control mb-2"
              onChange={handleChange}
            />
            {errors.salary && (
              <small className="text-danger">{errors.salary}</small>
            )}

            {/* PHONE */}
            <input
              name="phone"
              placeholder="Phone"
              className="form-control mb-2"
              onChange={handleChange}
            />

            {/* ADDRESS */}
            <input
              name="address"
              placeholder="Address"
              className="form-control mb-3"
              onChange={handleChange}
            />

            {/* ACTIONS */}
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="btn btn-success btn-sm" onClick={handleCreate}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedEmployee && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Employee Details</h5>
              <button
                className="btn-close"
                onClick={() => setSelectedEmployee(null)}
              />
            </div>

            {/* EMPLOYEE INFO HEADER */}
            <div className="text-center mb-3">
              <img
                src="/image.png"
                alt="avatar"
                width="80"
                height="80"
                className="rounded-circle mb-2"
              />

              <h5 className="mb-0">
                {selectedEmployee.userId?.name || "Unknown"}
              </h5>

              <p className="text-muted mb-1">{selectedEmployee.jobTitle}</p>

              <span
                className={`badge ${
                  selectedEmployee.userId?.isActive ? "bg-success" : "bg-danger"
                }`}
              >
                {selectedEmployee.userId?.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <hr />

            {/* DETAILS */}
            <div className="small">
              <div className="mb-2">
                <strong>Email:</strong>{" "}
                {selectedEmployee.userId?.email || "N/A"}
              </div>

              <div className="mb-2">
                <strong>Department:</strong>{" "}
                {selectedEmployee.departmentId?.name || "No Department"}
              </div>

              <div className="mb-2">
                <strong>Manager:</strong>{" "}
                {selectedEmployee.departmentId?.managerId?.name || "No Manager"}
              </div>

              <div className="mb-2">
                <strong>Salary:</strong> {selectedEmployee.salary} JD
              </div>

              <div className="mb-2">
                <strong>Hire Date:</strong>{" "}
                {selectedEmployee.hireDate
                  ? new Date(selectedEmployee.hireDate).toLocaleDateString()
                  : "N/A"}
              </div>

              <div className="mb-2">
                <strong>Phone:</strong> {selectedEmployee.phone || "N/A"}
              </div>

              <div className="mb-2">
                <strong>Address:</strong> {selectedEmployee.address || "N/A"}
              </div>

              <div className="mb-2">
                <strong>Created At:</strong>{" "}
                {selectedEmployee.createdAt
                  ? new Date(selectedEmployee.createdAt).toLocaleString()
                  : "N/A"}
              </div>

              <div className="mb-2">
                <strong>Updated At:</strong>{" "}
                {selectedEmployee.updatedAt
                  ? new Date(selectedEmployee.updatedAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>

            {/* CLOSE */}
            <button
              className="btn btn-secondary w-100 mt-3"
              onClick={() => setSelectedEmployee(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editEmployee && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "420px" }}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Edit Employee</h5>
              <button
                className="btn-close"
                onClick={() => setEditEmployee(null)}
              />
            </div>

            {/* GENERAL ERROR */}
            {errors.general && (
              <div className="alert alert-danger py-2">{errors.general}</div>
            )}

            {/* DEPARTMENT */}
            <select
              name="departmentId"
              value={
                editEmployee.departmentId?._id || editEmployee.departmentId
              }
              onChange={handleEditChange}
              className="form-select my-2"
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

            {/* JOB TITLE */}
            <input
              name="jobTitle"
              value={editEmployee.jobTitle || ""}
              onChange={handleEditChange}
              placeholder="Job Title"
              className="form-control my-2"
            />
            {errors.jobTitle && (
              <small className="text-danger">{errors.jobTitle}</small>
            )}

            {/* SALARY */}
            <input
              name="salary"
              value={editEmployee.salary || ""}
              onChange={handleEditChange}
              placeholder="Salary"
              className="form-control my-2"
            />
            {errors.salary && (
              <small className="text-danger">{errors.salary}</small>
            )}

            {/* PHONE */}
            <input
              name="phone"
              value={editEmployee.phone || ""}
              onChange={handleEditChange}
              placeholder="Phone"
              className="form-control my-2"
            />

            {/* ADDRESS */}
            <input
              name="address"
              value={editEmployee.address || ""}
              onChange={handleEditChange}
              placeholder="Address"
              className="form-control my-2"
            />

            {/* ACTIONS */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditEmployee(null)}
              >
                Cancel
              </button>

              <button className="btn btn-warning btn-sm" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "350px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Confirm Delete</h5>
              <button className="btn-close" onClick={() => setDeleteId(null)} />
            </div>

            <p className="text-muted">
              Are you sure you want to delete this employee?
            </p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-center gap-2 mt-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

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

        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
