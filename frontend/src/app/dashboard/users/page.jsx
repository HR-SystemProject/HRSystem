
"use client";
import { useState, useEffect } from "react";
import {
getUsers,
getUserById,
deleteUser,
} from "../../../services/user";
import { FaEye, FaTrash } from "react-icons/fa";

export default function Page() {
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [deleteUserId, setDeleteUserId] = useState(null);

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

const handleViewUser = async (id) => {
try {
const res = await getUserById(id);
setSelectedUser(res.data.data);
} catch (err) {
console.log(err);
}
};

const openDelete = (id) => {
setDeleteUserId(id);
};

const handleDeleteUser = async () => {
try {
await deleteUser(deleteUserId);
setDeleteUserId(null);
fetchUsers();
} catch (err) {
console.log(err);
}
};

return ( <div className="container py-5"> <div className="mb-4"> <h3 className="fw-bold">Users Management</h3> </div>


  {/* View user */}
  {selectedUser && (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
    >
      <div className="bg-white p-4 rounded shadow" style={{ width: "450px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">{selectedUser.name}</h5>
          <button
            className="btn-close"
            onClick={() => setSelectedUser(null)}
          ></button>
        </div>

        <p><strong>Email:</strong> {selectedUser.email}</p>
        <p><strong>Role:</strong> {selectedUser.role?.roleName}</p>
        <p><strong>Status:</strong> {selectedUser.isActive ? "Active" : "Inactive"}</p>

        <div className="text-muted small mt-3">
          <div>
            Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
          </div>
          <div>
            Updated: {new Date(selectedUser.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Delete user */}
  {deleteUserId && (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
    >
      <div className="bg-white p-4 rounded shadow" style={{ width: "350px" }}>
        <h5 className="mb-3">Confirm Delete</h5>

        <p>Are you sure you want to delete this user?</p>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setDeleteUserId(null)}
          >
            Cancel
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDeleteUser}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )}

  <div className="row g-3">
    {users.map((user) => (
      <div key={user._id} className="col-md-6">
        <div className="card shadow-sm border-0 h-100 d-flex flex-column">
          <div className="card-body d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0 fw-semibold">{user.name}</h5>

              <span className="badge bg-secondary">
                {user.role?.roleName}
              </span>
            </div>

            <div className="mb-3">
              <small className="text-muted">{user.email}</small>
            </div>

            <div className="d-flex gap-2 mt-auto">
              <button
                onClick={() => handleViewUser(user._id)}
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3"
              >
                <FaEye size={13} /> View
              </button>

              <button
                onClick={() => openDelete(user._id)}
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
