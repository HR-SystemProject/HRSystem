"use client";
import { useState, useEffect } from "react";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../../../services/role";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";

export default function RolesPage() {
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roleName: "",
    permissions: "",
  });
  const [editRole, setEditRole] = useState(null);
  const [deleteRoleId, setDeleteRoleId] = useState(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setFormData({ roleName: "", permissions: "" });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewRole = async (id) => {
    try {
      const res = await getRoleById(id);
      setSelectedRole(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRole = async () => {
    if (!validate()) return;

    try {
      const payload = {
        roleName: formData.roleName,
        permissions: formData.permissions
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p),
      };

      await createRole(payload);

      setShowModal(false);
      setFormData({ roleName: "", permissions: "" });
      setErrors({});
      await fetchRoles();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditRole = (role) => {
    setEditRole({
      ...role,
      permissions: role.permissions.join(", "),
    });
  };

  const handleEditChange = (e) => {
    setEditRole({
      ...editRole,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateRole = async () => {
    if (!validateEdit()) return;
    try {
      const payload = {
        roleName: editRole.roleName,
        permissions: editRole.permissions
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      await updateRole(editRole._id, payload);

      setEditRole(null);
      setErrors({});
      fetchRoles();
    } catch (err) {
      console.log(err);
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.roleName.trim()) {
      newErrors.roleName = "Role name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateEdit = () => {
    let newErrors = {};

    if (!editRole.roleName || !editRole.roleName.trim()) {
      newErrors.roleName = "Role name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const openDelete = (id) => {
    setDeleteRoleId(id);
  };

  const closeDelete = () => {
    setDeleteRoleId(null);
  };

  const handleDeleteRole = async () => {
    try {
      const res = await deleteRole(deleteRoleId);

      setDeleteRoleId(null);
      fetchRoles();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredRoles = (roles || []).filter((role) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      role.roleName?.toLowerCase().includes(searchText) ||
      (role.permissions || []).some((p) =>
        p.toLowerCase().includes(searchText),
      );

    const matchRole =
      roleFilter === "all" ? true : role.roleName?.toLowerCase() === roleFilter;

    return matchSearch && matchRole;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column align-items-start mb-4 gap-2">
        <h3 className="fw-bold m-0">🛡️ Roles Management</h3>
        <small className="text-muted">
          Assign and manage employee roles & system permissions
        </small>

        <button
          onClick={openModal}
          className="btn btn-success d-flex align-items-center gap-2 mt-5"
        >
          <FaPlus size={14} />
          Add Role
        </button>
      </div>

      <div className="d-flex gap-2 mb-3 justify-content-center">
        <input
          className="form-control w-25"
          placeholder="Search by role name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select w-25"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* View role */}
      {selectedRole && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">{selectedRole.roleName}</h5>

              <button
                className="btn-close"
                onClick={() => setSelectedRole(null)}
              ></button>
            </div>

            <div className="mb-3 text-end">
              <span className="badge bg-secondary">
                {selectedRole.permissions?.length} permissions
              </span>
            </div>

            {/* Permissions */}
            <div className="d-flex flex-wrap gap-1 mb-3">
              {selectedRole.permissions?.map((p, i) => (
                <span key={i} className="badge bg-light text-dark border">
                  {p}
                </span>
              ))}
            </div>

            {/* Dates */}
            <div className="text-muted small">
              <div>
                Created: {new Date(selectedRole.createdAt).toLocaleDateString()}
              </div>
              <div>
                Updated: {new Date(selectedRole.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create role */}
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
              <h5 className="fw-bold mb-0">Create Role</h5>

              <button className="btn-close" onClick={closeModal}></button>
            </div>

            <input
              name="roleName"
              placeholder="Role Name"
              className="form-control mb-2"
              onChange={handleChange}
              value={formData.roleName}
            />
            {errors.roleName && (
              <small className="text-danger m-0">{errors.roleName}</small>
            )}

            <input
              name="permissions"
              placeholder="permissions (comma separated)"
              className="form-control my-3"
              onChange={handleChange}
              value={formData.permissions}
            />

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={handleAddRole}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit role */}
      {editRole && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Edit Role</h5>

              <button className="btn-close" onClick={() => setEditRole(null)} />
            </div>

            {/* Role Name */}
            <input
              name="roleName"
              className="form-control mb-2"
              value={editRole.roleName}
              onChange={handleEditChange}
            />
            {errors.roleName && (
              <small className="text-danger">{errors.roleName}</small>
            )}

            {/* Permissions */}
            <input
              name="permissions"
              className="form-control my-3"
              value={editRole.permissions}
              onChange={handleEditChange}
            />

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditRole(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-warning btn-sm"
                onClick={handleUpdateRole}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete role */}
      {deleteRoleId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "350px" }}
          >
            <h5 className="mb-3">Confirm Delete</h5>

            <p>Are you sure you want to delete this role?</p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteRoleId(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3"
                onClick={handleDeleteRole}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3">
        {filteredRoles.map((role) => (
          <div key={role._id} className="col-md-6">
            <div className="card shadow-sm border-0 h-100 d-flex flex-column">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 fw-semibold">{role.roleName}</h5>

                  <span className="badge bg-secondary">
                    {role.permissions?.length || 0}
                  </span>
                </div>

                <div className="mb-3 d-flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 3).map((p, i) => (
                    <span key={i} className="badge bg-light text-dark border">
                      {p}
                    </span>
                  ))}

                  {role.permissions?.length > 3 && (
                    <span className="badge bg-info text-dark">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <button
                    onClick={() => handleViewRole(role._id)}
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3"
                  >
                    <FaEye size={13} /> View
                  </button>

                  <button
                    onClick={() => handleEditRole(role)}
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-3"
                  >
                    <FaEdit size={13} /> Edit
                  </button>

                  <button
                    onClick={() => openDelete(role._id)}
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
