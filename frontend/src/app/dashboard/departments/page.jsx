"use client";
import { useState, useEffect } from "react";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../services/departments";
import { getRole } from "../../../utils/auth";
import { getUsers } from "../../../services/users";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import {
  BarChart,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
export default function DepartmentsPage() {
  const router = useRouter();
  const role = getRole();

  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [search, setSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

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
    if (!role || !["admin", "hr"].includes(role.roleName)) {
      router.push("/unauthorized");
    }
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

  const handleDeleteDepartment = async () => {
    try {
      const res = await deleteDepartment(deleteDepartmentId);

      setDeleteDepartmentId(null);
      fetchDepartments();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredDepartments = departments.filter((dep) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      dep.name?.toLowerCase().includes(searchText) ||
      dep.description?.toLowerCase().includes(searchText) ||
      dep.managerId?.name?.toLowerCase().includes(searchText);

    const matchDepartment =
      departmentFilter === "" || dep.name === departmentFilter;

    const matchManager =
      managerFilter === "" || dep.managerId?._id === managerFilter;

    return matchSearch && matchDepartment && matchManager;
  });



  const chartData = departments.map((dep) => ({
    name: dep.name,
    employees: dep.employeesCount || 0,
  }));

  const COLORS = [
    "#a2a5fa",
    "#c9fdec",
    "#ffeed1",
    "#ffb6b6",
    "#aca7b6",
    "#fef49f",
    "#c5fe9f",
    "#e780f0",
    "#fe9f9f",
    "#9ff9fe",
  ];

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, managerFilter, departmentFilter]);

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold">🏢 Management Department</h3>
          <small className="text-muted">
            Create and manage company departments
          </small>
        </div>
        {role?.roleName === "admin" && (
          <button
            onClick={openModal}
            className="btn btn-success d-flex align-items-center gap-2"
          >
            <FaPlus size={14} />
            Create New Department
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="d-flex gap-2 mb-3 justify-content-center">
        <input
          className="form-control w-25"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select w-25"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>

          {departments.map((dep) => (
            <option key={dep._id} value={dep.name}>
              {dep.name}
            </option>
          ))}
        </select>

        {/* Manager filter */}
        <select
          className="form-select w-25"
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
        >
          <option value="">All Managers</option>

          {managers.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => {
            setSearch("");
            setDepartmentFilter("");
            setManagerFilter("");
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* CHART */}
      <div className="card p-3 shadow-sm mb-4" style={{ borderRadius: "14px" }}>
        <h6 className="mb-3">Employees per Department</h6>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} domain={[0, "dataMax + 2"]} />
            <Tooltip />

            <Bar dataKey="employees" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Department</th>
                <th>Manager</th>
                <th>Employees</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedDepartments.map((dep) => (
                <tr key={dep._id}>
                  <td className="fw-semibold">{dep.name}</td>

                  <td>{dep.managerId?.name || "—"}</td>

                  <td>{dep.employeesCount || 0}</td>

                  <td>{new Date(dep.createdAt).toLocaleDateString()}</td>

                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleViewDepartment(dep._id)}
                    >
                      <FaEye />
                    </button>

                    {role?.roleName === "admin" && (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleEditDepartment(dep)}
                      >
                        <FaEdit />
                      </button>
                    )}

                    {role?.roleName === "admin" && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => openDelete(dep._id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {selectedDepartment?.employees?.length > 0 ? (
                  selectedDepartment.employees.map((emp) => (
                    <div key={emp._id}>{emp.userId?.name}</div>
                  ))
                ) : (
                  <p className="text-muted">No employees</p>
                )}
              </div>
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
      <div className="d-flex justify-content-center gap-2 mt-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
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
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
