"use client";
import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../../services/users";
import { FaEye, FaTrash } from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">Users Management</h3>

      <div className="row g-3">
        {users.map((u) => (
          <div key={u._id} className="col-md-4">
            <div className="card shadow-sm border-0 transition-card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold">{u.name}</h5>
                <p className="text-muted mb-1">{u.email}</p>
                <span className="badge bg-primary w-fit mb-3">
                  {u.role?.roleName}
                </span>

                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-sm btn-outline-primary">
                    <FaEye /> View
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteId(u._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div className="bg-white p-4 rounded shadow" style={{ width: "350px" }}>
            <h5 className="fw-bold mb-3">Confirm Delete</h5>
            <p className="text-muted">Are you sure you want to delete this user?</p>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}