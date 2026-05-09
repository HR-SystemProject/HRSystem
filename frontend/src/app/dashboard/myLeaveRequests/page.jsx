"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";
import {
  getLeaveRequestsTypes,
  createLeaveRequests,
  getEmployeeLeaveRequests,
  updateMyLeaveRequest,
  cancelLeaveRequest,
} from "@/services/leaveRequests";

import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

export default function MyLeaveRequestsPage() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    if (!["admin", "hr"].includes(roleName)) {
      router.replace("/unauthorized");
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await getLeaveRequestsTypes();
      setLeaveTypes(res.data.data);
    };
    fetchTypes();
  }, []);

  const fetchRequests = async () => {
    const res = await getEmployeeLeaveRequests();
    setMyRequests(res.data.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = myRequests.filter((req) => {
    const matchStatus = statusFilter === "all" || req.status === statusFilter;

    const matchSearch =
      search === "" ||
      req.employeeId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.employeeId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      req.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
      req.reason?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditingId(null);
    setApiError("");

    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const validate = () => {
    const newErrors = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.leaveType) newErrors.leaveType = "Leave type is required";

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (new Date(formData.startDate) < today) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (new Date(formData.endDate) < today) {
      newErrors.endDate = "End date cannot be in the past";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.date = "End date cannot be before start date";
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = "Reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      if (isEdit) {
        await updateMyLeaveRequest(editingId, formData);
      } else {
        await createLeaveRequests(formData);
      }

      await fetchRequests();
      closeModal();
    } catch (err) {
      setApiError(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (req) => setSelectedRequest(req);

  const handleEdit = (req) => {
    setIsEdit(true);
    setEditingId(req._id);

    setFormData({
      leaveType: req.leaveType,
      startDate: new Date(req.startDate).toISOString().split("T")[0],
      endDate: new Date(req.endDate).toISOString().split("T")[0],
      reason: req.reason,
    });

    setShowModal(true);
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This request will be cancelled!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelLeaveRequest(id);
      setMyRequests((prev) => prev.filter((x) => x._id !== id));

      if (selectedRequest?._id === id) setSelectedRequest(null);

      Swal.fire("Cancelled", "Request removed", "success");
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="container py-4">
      <h3>My Leave Requests</h3>

      <button className="btn btn-success mt-3" onClick={openModal}>
        <FaPlus /> New Request
      </button>

      {/* SEARCH */}
      <div className="mb-3 d-flex justify-content-center">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select  w-25"
          style={{ width: "200px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <table className="table mt-4">
        <thead>
          <tr>
            <th>Type</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedRequests.map((req) => (
            <tr key={req._id}>
              <td>{req.leaveType}</td>
              <td>{new Date(req.startDate).toLocaleDateString()}</td>
              <td>{new Date(req.endDate).toLocaleDateString()}</td>
              <td>{req.status}</td>
              <td>{req.reason}</td>

              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleView(req)}
                >
                  <FaEye />
                </button>

                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => handleEdit(req)}
                  disabled={req.status !== "pending"}
                >
                  <FaEdit />
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleCancel(req._id)}
                  disabled={req.status !== "pending"}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View */}
      {selectedRequest && !isEdit && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 border-0 shadow">
              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0 fw-bold">Leave Request Details</h5>

                <button
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>

              {/* EMPLOYEE */}
              <div className="mb-3">
                <h6 className="fw-bold text-secondary">Employee</h6>

                <div>
                  <strong>Name:</strong>{" "}
                  {selectedRequest.employeeId?.name || "—"}
                </div>
                <div>
                  <strong>Email:</strong>{" "}
                  {selectedRequest.employeeId?.email || "—"}
                </div>
              </div>

              <hr />

              {/* LEAVE INFO */}
              <div className="mb-3">
                <h6 className="fw-bold text-secondary">Leave Info</h6>

                <div>
                  <strong>Type:</strong> {selectedRequest.leaveType}
                </div>

                <div>
                  <strong>Start:</strong>{" "}
                  {new Date(selectedRequest.startDate).toLocaleDateString()}
                </div>

                <div>
                  <strong>End:</strong>{" "}
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </div>

                <div>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      selectedRequest.status === "approved"
                        ? "text-success"
                        : selectedRequest.status === "rejected"
                          ? "text-danger"
                          : "text-warning"
                    }
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div>
                  <strong>Reason:</strong> {selectedRequest.reason || "—"}
                </div>

                <div>
                  <strong>Approved By:</strong>{" "}
                  {selectedRequest.approvedBy?.name || "Not approved yet"}
                </div>
              </div>

              <hr />

              {/* SYSTEM */}
              <div className="mb-3">
                <h6 className="fw-bold text-secondary">System</h6>

                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </div>

                <div>
                  <strong>Updated:</strong>{" "}
                  {new Date(selectedRequest.updatedAt).toLocaleString()}
                </div>
              </div>

              {/* CLOSE */}
              <div className="text-end">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              {/* HEADER */}
              <h5 className="mb-3">
                {isEdit ? "Edit Leave Request" : "Create Leave Request"}
              </h5>

              {/* LEAVE TYPE */}
              <select
                className="form-control"
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
              >
                <option value="">Select Type</option>
                {leaveTypes.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.leaveType && (
                <small className="text-danger">{errors.leaveType}</small>
              )}

              {/* START DATE */}
              <input
                type="date"
                className="form-control mt-2"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
              {errors.startDate && (
                <small className="text-danger">{errors.startDate}</small>
              )}

              {/* END DATE */}
              <input
                type="date"
                className="form-control mt-2"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
              {errors.endDate && (
                <small className="text-danger">{errors.endDate}</small>
              )}

              {errors.date && (
                <small className="text-danger">{errors.date}</small>
              )}

              {/* REASON */}
              <textarea
                className="form-control mt-2"
                placeholder="Reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
              {errors.reason && (
                <small className="text-danger">{errors.reason}</small>
              )}

              {/* API ERROR */}
              {apiError && (
                <div className="alert alert-danger mt-2">{apiError}</div>
              )}

              {/* BUTTONS */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : isEdit
                      ? "Update Request"
                      : "Create Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
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
