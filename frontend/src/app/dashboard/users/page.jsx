"use client";
import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser } from "../../../services/users";
import { FaEye, FaTrash } from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await deleteUser(deleteId, token);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      u.name?.toLowerCase().includes(searchText) ||
      u.email?.toLowerCase().includes(searchText);

    const matchRole =
      roleFilter === "all"
        ? true
        : u.role?.roleName?.toLowerCase() === roleFilter;

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? u.isActive === true
          : u.isActive === false;

    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleToggleStatus = async (user) => {
    try {
      await updateUser(user._id, {
        isActive: !user.isActive,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container py-5">
      <h3 className="fw-bold m-0">👤 Users Management</h3>
      <small className="text-muted">Manage employee leave requests</small>

      <div className="row my-4 g-3">
        {/* Total Users */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">Total Users</h6>
                <h3 className="fw-bold">{totalUsers}</h3>
              </div>
              <div className="fs-2 text-primary">👥</div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">Active Users</h6>
                <h3 className="fw-bold text-success">{activeUsers}</h3>
              </div>
              <div className="fs-2 text-success">🟢</div>
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">Inactive Users</h6>
                <h3 className="fw-bold text-danger">{inactiveUsers}</h3>
              </div>
              <div className="fs-2 text-danger">🔴</div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
        {/* Search */}
        <input
          className="form-control w-25"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Role filter */}
        <select
          className="form-select w-25"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="hr">Hr</option>
        </select>

        {/* Status filter */}
        <select
          className="form-select w-25"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Permissions</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.map((u) => (
              <tr key={u._id}>
                {/* User (avatar + name) */}
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src="/image.png"
                      alt="avatar"
                      width="40"
                      height="40"
                      className="rounded-circle object-fit-cover"
                    />
                    <span className="fw-semibold">{u.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="text-muted">{u.email}</td>

                {/* Role */}
                <td>{u.role?.roleName || "No role"}</td>

                {/* Status */}
                <td>
                  <span
                    onClick={() => handleToggleStatus(u)}
                    className={`badge ${u.isActive ? "bg-success" : "bg-danger"}`}
                    style={{ cursor: "pointer" }}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Permissions count */}
                <td>
                  <span className="badge bg-secondary">
                    {u.role?.permissions?.length || 0}
                  </span>
                </td>

                {/* Actions */}
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedUser(u)}
                    >
                      <FaEye /> View
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteId(u._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {selectedUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">User Details</h5>
              <button
                className="btn-close"
                onClick={() => setSelectedUser(null)}
              />
            </div>

            <div className="text-center mb-3">
              <img
                src="/image.png"
                alt="avatar"
                width="80"
                height="80"
                className="rounded-circle"
              />
              <h5 className="mt-2">{selectedUser.name}</h5>
              <p className="text-muted">{selectedUser.email}</p>
            </div>

            <div className="mb-2">
              <strong>Role:</strong> {selectedUser.role?.roleName}
            </div>

            <div className="mb-2">
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  selectedUser.isActive ? "bg-success" : "bg-danger"
                }`}
              >
                {selectedUser.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mb-2">
              <strong>Permissions:</strong>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {selectedUser.role?.permissions?.map((p, i) => (
                  <span key={i} className="badge bg-light text-dark border">
                    {p}
                  </span>
                ))}
              </div>
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
            <h5 className="fw-bold mb-3">Confirm Delete</h5>
            <p className="text-muted">
              Are you sure you want to delete this user?
            </p>

            <div className="d-flex justify-content-end gap-2">
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
