"use client";
import { useState, useEffect } from "react";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../services/departments";
import { getUsers } from "../../../services/users";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
export default function DepartmentsPage() {
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
  });
  const [editDepartment, setEditDepartment] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [deleteDepartmentId, setDeleteDepartmentId] = useState(null);
  const [managers, setManagers] = useState([]);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", description: "", managerId: "" });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await getUsers();
      setManagers(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const handleViewDepartment = async (id) => {
    try {
      const res = await getDepartmentById(id);
      setSelectedDepartment(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDepartment = async () => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await createDepartment(formData);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        managerId: formData.managerId,
      };

      await createDepartment(payload);

      setShowModal(false);
      setFormData({ name: "", description: "", managerId: "" });
      setErrors({});
      await fetchDepartments();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditDepartment = (department) => {
    setEditDepartment({
      ...department,
    });
  };

  const handleEditChange = (e) => {
    setEditDepartment({
      ...editDepartment,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateDepartment = async () => {
    const validationErrors = validate(editDepartment);
    setEditErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await updateDepartment(editDepartment._id, editDepartment);

    try {
      const payload = {
        name: editDepartment.name,
        description: editDepartment.description,
        managerId: editDepartment.managerId,
      };

      await updateDepartment(editDepartment._id, payload);

      setEditDepartment(null);
      setErrors({});
      fetchDepartments();
    } catch (err) {
      console.log(err);
    }
  };

  const validate = (data) => {
    let newErrors = {};

    if (!data.name || !data.name.trim()) {
      newErrors.name = "Department name is required";
    }

    if (!data.managerId) {
      newErrors.managerId = "Manager is required";
    }

    return newErrors;
  };

   const openDelete = (id) => {
      setDeleteDepartmentId(id);
    };
  
    const closeDelete = () => {
      setDeleteDepartmentId(null);
    };
  
    const handleDeleteDepartment = async () => {
      try {
        const res = await deleteDepartment(deleteDepartmentId);
  
        setDeleteDepartmentId(null);
        fetchDepartments();
      } catch (err) {
        console.log(err);
      }
    };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column align-items-start mb-4 gap-2">
        <h3 className="fw-bold m-0">Departments Management</h3>

        <button
          onClick={openModal}
          className="btn btn-success d-flex align-items-center gap-2"
        >
          <FaPlus size={14} />
          Add Department
        </button>
      </div>

      {/* View department */}
      {selectedDepartment && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">{selectedDepartment.name}</h5>

              <button
                className="btn-close"
                onClick={() => setSelectedDepartment(null)}
              ></button>
            </div>

            {/* Description */}
            <div className="mb-2">
              <strong>Description:</strong>
              <p className="mb-1 text-muted">
                {selectedDepartment.description || "No description"}
              </p>
            </div>

            {/* Manager */}
            <div className="mb-2">
              <strong>Manager:</strong>
              <p className="mb-1 text-muted">
                {selectedDepartment.managerId?.name || "Not assigned"}
              </p>
            </div>

            {/* Employees */}
            <div className="mb-2">
              <strong>Employees:</strong>
              <p className="mb-1 text-muted">
                {selectedDepartment.employees?.length > 0
                  ? selectedDepartment.employees.length
                  : "No employees"}
              </p>
            </div>

            {/* Dates */}
            <div className="text-muted small mt-3">
              <div>
                Created:{" "}
                {new Date(selectedDepartment.createdAt).toLocaleDateString()}
              </div>
              <div>
                Updated:{" "}
                {new Date(selectedDepartment.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create department */}
      {showModal && (
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
              <h5 className="fw-bold mb-0">Create Department</h5>

              <button className="btn-close" onClick={closeModal}></button>
            </div>

            <input
              name="name"
              placeholder="Department Name"
              className="form-control mb-2"
              onChange={handleChange}
              value={formData.name}
            />
            {errors.name && (
              <small className="text-danger m-0">{errors.name}</small>
            )}

            <input
              name="description"
              placeholder="Description"
              className="form-control my-3"
              onChange={handleChange}
              value={formData.description}
            />

            <select
              name="managerId"
              className="form-select mb-3"
              value={formData.managerId}
              onChange={handleChange}
            >
              <option value="">Select Manager</option>

              {managers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

            {errors.managerId && (
              <small className="text-danger m-0">{errors.managerId}</small>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={handleAddDepartment}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit department */}
      {editDepartment && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Edit Department</h5>

              <button
                className="btn-close"
                onClick={() => setEditDepartment(null)}
              />
            </div>

            {/* Department Name */}
            <input
              name="name"
              className="form-control mb-2"
              value={editDepartment.name}
              onChange={handleEditChange}
            />
            {errors.name && (
              <small className="text-danger">{errors.name}</small>
            )}

            {/* Description */}
            <input
              name="description"
              className="form-control my-3"
              value={editDepartment.description}
              onChange={handleEditChange}
            />

            {/* Manager */}
            <select
              name="managerId"
              className="form-select mb-3"
              value={editDepartment.managerId?._id || editDepartment.managerId}
              onChange={handleEditChange}
            >
              <option value="">Select Manager</option>

              {managers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditDepartment(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-warning btn-sm"
                onClick={handleUpdateDepartment}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete department */}
      {deleteDepartmentId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "350px" }}
          >
            <h5 className="mb-3">Confirm Delete</h5>

            <p>Are you sure you want to delete this department?</p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteDepartmentId(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3"
                onClick={handleDeleteDepartment}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3">
        {departments.map((dep) => (
          <div key={dep._id} className="col-md-6">
            <div className="card shadow-sm border-0 h-100 d-flex flex-column">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 fw-semibold">{dep.name}</h5>
                </div>
                <small className="my-3 fw-semibold text-muted">
                  {dep.description}
                </small>

                <div className="d-flex gap-2 mt-auto">
                  <button
                    onClick={() => handleViewDepartment(dep._id)}
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3"
                  >
                    <FaEye size={13} /> View
                  </button>

                  <button
                    onClick={() => handleEditDepartment(dep)}
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-3"
                  >
                    <FaEdit size={13} /> Edit
                  </button>

                  <button
                    onClick={() => openDelete(dep._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <FaTrash size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
