"use client";
import { useState, useEffect } from "react";
import {
  getLeaveRequests,
  createLeaveRequests,
  getLeaveRequestsTypes,
  updateLeaveRequestsStatus,
} from "../../../services/leaveRequests";
import { FaEye, FaCheck, FaTimes, FaPlus } from "react-icons/fa";

export default function LeaveRequestsPage() {
  const [loadingId, setLoadingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const handleCreateLeaveRequest = async () => {
    if (!validate()) return;

    try {
      await createLeaveRequests(formData);

      setShowModal(false);
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setErrors({});
      fetchLeaveRequests(page, search);
    } catch (err) {
      setErrors({
        api: err.response?.data?.message,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = "Leave type is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.startDate) {
      const start = new Date(formData.startDate);

      if (start < today) {
        newErrors.startDate = "Start date cannot be in the past";
      }
    }

    if (formData.endDate) {
      const end = new Date(formData.endDate);

      if (end < today) {
        newErrors.endDate = "End date cannot be in the past";
      }
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.date = "Start date cannot be after end date";
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const filteredRequests = leaveRequests.filter((req) => {
    const matchStatus = statusFilter === "all" || req.status === statusFilter;

    const matchSearch =
      search === "" ||
      req.employeeId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.employeeId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      req.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
      req.reason?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  useEffect(() => {
    fetchLeaveRequests(page, search);
  }, [page, search]);

  const fetchLeaveRequests = async (pageNumber = 1, searchValue = "") => {
    try {
      const res = await getLeaveRequests(pageNumber, searchValue);

      setLeaveRequests(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await getLeaveRequestsTypes();
        setLeaveTypes(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTypes();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      setLoadingId(id);
      setErrors({});

      await updateLeaveRequestsStatus(id, status);

      fetchLeaveRequests(page, search);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND RESPONSE:", err.response?.data);

      setErrors({
        api: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="fw-bold m-0">👋🏻 Leave requests Management</h3>

          <button
            onClick={openModal}
            className="btn btn-success d-flex align-items-center gap-2"
          >
            <FaPlus size={14} />
            New request
          </button>
        </div>

        <small className="text-muted">Manage employee leave requests</small>
      </div>

      {errors.api && (
        <div className="alert alert-danger py-2">{errors.api}</div>
      )}

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5 className="mb-3">New Leave Request</h5>

              <select
                className="form-control mb-1"
                name="leaveType"
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
              >
                <option value="">Select Type</option>
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {errors.leaveType && (
                <small className="text-danger my-2">{errors.leaveType}</small>
              )}

              <input
                type="date"
                className="form-control mb-1"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />

              {errors.startDate && (
                <small className="text-danger my-2">{errors.startDate}</small>
              )}

              <input
                type="date"
                className="form-control mb-1"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />

              {errors.endDate && (
                <small className="text-danger my-2">{errors.endDate}</small>
              )}

              <textarea
                className="form-control mb-1"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />

              {errors.reason && (
                <small className="text-danger my-2">{errors.reason}</small>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={handleCreateLeaveRequest}
                >
                  Submit
                </button>
              </div>
              {errors.api && (
                <div className="alert alert-danger mt-2">{errors.api}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 d-flex gap-3 align-items-center justify-content-center">
        <input
          type="text"
          placeholder="Search by employee name"
          className="form-control  w-25"
          style={{ width: "250px" }}
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
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              {/* Header */}
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req._id}>
                    {/* Employee */}
                    <td>
                      <div className="fw-semibold">
                        {req.employeeId?.name || "—"}
                      </div>
                      <small className="text-muted">
                        {req.employeeId?.email}
                      </small>
                    </td>

                    {/* Type */}
                    <td>{req.leaveType}</td>

                    {/* Dates */}
                    <td>{new Date(req.startDate).toLocaleDateString()}</td>
                    <td>{new Date(req.endDate).toLocaleDateString()}</td>

                    {/* Reason */}
                    <td className="text-truncate" style={{ maxWidth: "150px" }}>
                      {req.reason}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          width: "100px",
                          textAlign: "center",
                          color:
                            req.status === "approved"
                              ? "#20925d"
                              : req.status === "rejected"
                                ? "#c60f25"
                                : "#d7ae34",
                          backgroundColor:
                            req.status === "approved"
                              ? "#a9f9d4d0"
                              : req.status === "rejected"
                                ? "#f5c0c6"
                                : "#fbefca",
                        }}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Approved By */}
                    <td>
                      {req.approvedBy ? (
                        <>
                          <div className="fw-semibold">
                            {req.approvedBy.name}
                          </div>
                          <small className="text-muted">
                            {req.approvedBy.email}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-success rounded"
                          onClick={() => handleStatus(req._id, "approved")}
                          disabled={
                            req.status !== "pending" || loadingId === req._id
                          }
                        >
                          {loadingId === req._id ? (
                            "..."
                          ) : (
                            <FaCheck size={14} />
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger rounded"
                          onClick={() => handleStatus(req._id, "rejected")}
                          disabled={
                            req.status !== "pending" || loadingId === req._id
                          }
                        >
                          {loadingId === req._id ? (
                            "..."
                          ) : (
                            <FaTimes size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
            {/* Prev */}
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            {/* Pages */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${
                  page === i + 1 ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            {/* Next */}
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
