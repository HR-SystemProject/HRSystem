"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, getUser, getUserId } from "@/utils/auth";
import { getMyEmployee } from "@/services/employees";
import {
  updateProfile,
  changePassword,
} from "@/services/users";

import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import Swal from "sweetalert2";

export default function Page() {
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
  });

  const [errors, setErrors] = useState({});

  // PASSWORD STATES
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string"
        ? role
        : role?.roleName || role?.role?.roleName;

    if (roleName !== "user") {
      router.replace("/unauthorized");
      return;
    }

    fetchEmployee();
  }, [router]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);

      const res = await getMyEmployee();

      setEmployee(res.data.data);
    } catch (err) {
      console.log(err);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    const user = getUser();

    setFormData({
      name: user?.name || "",
      profileImage: user?.profileImage || "",
    });

    setErrors({});
    setApiError("");
    setIsEdit(true);
  };

  const closeEdit = () => {
    setIsEdit(false);
    setApiError("");
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const userId = getUserId();

      const res = await updateProfile(userId, formData);

      // update localStorage
      const currentUser = getUser();

      const updatedUser = {
        ...currentUser,
        ...res.data.data,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      closeEdit();

      await fetchEmployee();

      Swal.fire(
        "Success",
        "Profile updated successfully",
        "success"
      );
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Error occurred"
      );
    } finally {
      setSaving(false);
    }
  };

  // VALIDATE PASSWORD
  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword =
        "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword =
        "Password must be at least 8 characters";
    }

    if (
      passwordData.confirmPassword !==
      passwordData.newPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setPasswordErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setPasswordLoading(true);

      await changePassword({
        currentPassword:
          passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      Swal.fire(
        "Success",
        "Password changed successfully",
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          "Failed to change password",
        "error"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-5">
        Loading...
      </p>
    );
  }

  const user = getUser();

  return (
    <div className="container py-5">
      {/* PROFILE HEADER CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div
          className="rounded-top-4"
          style={{
            background:
              "linear-gradient(135deg, #dbeafe, #93c5fd)",
            height: "100px",
          }}
        />

        <div className="card-body px-4 pb-4">
          <div className="d-flex justify-content-between align-items-start">
            {/* AVATAR + NAME */}
            <div
              className="d-flex align-items-center gap-3"
              style={{ marginTop: "-40px" }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center border border-3 border-white shadow"
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#dbeafe",
                  flexShrink: 0,
                }}
              >
                <FaUserCircle
                  size={50}
                  color="#1d4ed8"
                />
              </div>

              <div className="mt-3">
                <h4 className="fw-bold mb-0">
                  {user?.name}
                </h4>

                <small className="text-muted">
                  {employee?.jobTitle || "—"}
                </small>
              </div>
            </div>

            {/* EDIT BUTTON */}
            <button
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={openEdit}
            >
              <FaEdit className="me-1" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="row g-4">
        {/* ACCOUNT INFO */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                Account Information
              </h5>

              <div className="mb-3">
                <small className="text-muted d-block">
                  Full Name
                </small>

                <span className="fw-semibold">
                  {user?.name || "—"}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">
                  Email
                </small>

                <span className="fw-semibold">
                  {user?.email || "—"}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">
                  Role
                </small>

                <span className="badge bg-primary-subtle text-primary text-capitalize">
                  {user?.role?.roleName || "user"}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">
                  Status
                </small>

                <span
                  className={`badge ${
                    user?.isActive
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  }`}
                >
                  {user?.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EMPLOYEE INFO */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                Employment Details
              </h5>

              {!employee ? (
                <p className="text-muted">
                  No employee record found.
                </p>
              ) : (
                <>
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Job Title
                    </small>

                    <span className="fw-semibold">
                      {employee.jobTitle || "—"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Department
                    </small>

                    <span className="fw-semibold">
                      {employee.departmentId?.name ||
                        "—"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Phone
                    </small>

                    <span className="fw-semibold">
                      {employee.phone || "—"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Address
                    </small>

                    <span className="fw-semibold">
                      {employee.address || "—"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Hire Date
                    </small>

                    <span className="fw-semibold">
                      {employee.hireDate
                        ? new Date(
                            employee.hireDate
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                Change Password
              </h5>

              <div className="row g-3">
                {/* CURRENT PASSWORD */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Current Password
                  </label>

                  <input
                    type="password"
                    className={`form-control ${
                      passwordErrors.currentPassword
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      passwordData.currentPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword:
                          e.target.value,
                      })
                    }
                  />

                  {passwordErrors.currentPassword && (
                    <small className="text-danger">
                      {
                        passwordErrors.currentPassword
                      }
                    </small>
                  )}
                </div>

                {/* NEW PASSWORD */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    New Password
                  </label>

                  <input
                    type="password"
                    className={`form-control ${
                      passwordErrors.newPassword
                        ? "is-invalid"
                        : ""
                    }`}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword:
                          e.target.value,
                      })
                    }
                  />

                  {passwordErrors.newPassword && (
                    <small className="text-danger">
                      {passwordErrors.newPassword}
                    </small>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    className={`form-control ${
                      passwordErrors.confirmPassword
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                  />

                  {passwordErrors.confirmPassword && (
                    <small className="text-danger">
                      {
                        passwordErrors.confirmPassword
                      }
                    </small>
                  )}
                </div>
              </div>

              <div className="mt-4 text-end">
                <button
                  className="btn btn-primary"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEdit && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 border-0 shadow">
              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0 fw-bold">
                  Edit Profile
                </h5>

                <button
                  className="btn-close"
                  onClick={closeEdit}
                />
              </div>

              {/* NAME */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Full Name
                </label>

                <input
                  type="text"
                  className={`form-control ${
                    errors.name
                      ? "is-invalid"
                      : ""
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />

                {errors.name && (
                  <small className="text-danger">
                    {errors.name}
                  </small>
                )}
              </div>

              {/* PROFILE IMAGE */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Profile Image URL
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="https://..."
                  value={formData.profileImage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profileImage:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* ERROR */}
              {apiError && (
                <div className="alert alert-danger">
                  {apiError}
                </div>
              )}

              {/* BUTTONS */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={closeEdit}
                >
                  <FaTimes className="me-1" />
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FaSave className="me-1" />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}