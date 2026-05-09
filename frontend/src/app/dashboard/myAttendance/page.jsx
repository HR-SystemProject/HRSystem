"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/utils/auth";
import {
  getMyTodayAttendance,
  getMonthlyAttendance,
} from "../../../services/attendance";

export default function MyAttendancePage() {
  const router = useRouter();

  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthly, setMonthly] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const role = getRole();

    const roleName =
      typeof role === "string" ? role : role?.roleName || role?.role?.roleName;

    if (!roleName) {
      router.replace("/unauthorized");
      return;
    }

    if (!["admin", "hr", "user"].includes(roleName)) {
      router.replace("/unauthorized");
    }
  }, [router]);

  const fetchAttendance = async () => {
    try {
      const res = await getMyTodayAttendance();
      setAttendance(res.data.data || null);
    } catch (err) {
      console.log(err);
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchMonthly = async (m) => {
    try {
      setLoadingMonth(true);
      const res = await getMonthlyAttendance(m);
      setMonthly(res.data.data);
    } catch (err) {
      console.log(err);
      setMonthly(null);
    } finally {
      setLoadingMonth(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchMonthly(month);
  }, [month]);

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const records = monthly?.records || [];

  const totalPages = Math.ceil(records.length / itemsPerPage);

  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container py-5">
      {/* TODAY CARD */}
      <div className="card p-4 shadow-sm rounded-4 text-center border-0 mb-4">
        {!attendance ? (
          <>
            <h5 className="fw-bold text-muted">Not checked in yet</h5>
            <button className="btn btn-success px-4 rounded-pill mt-3">
              Check In
            </button>
          </>
        ) : !attendance.checkOut ? (
          <>
            <h5 className="fw-bold text-warning-emphasis">
              🟡 Currently Working
            </h5>

            <p className="mb-1">
              <span className="text-muted">Check In:</span>{" "}
              {new Date(attendance.checkIn).toLocaleTimeString()}
            </p>

            <button className="btn btn-danger px-4 rounded-pill mt-3">
              Check Out
            </button>
          </>
        ) : (
          <>
            <h5 className="fw-bold text-success">🟢 Done for today</h5>

            <p>
              <span className="text-muted">Check In:</span>{" "}
              {new Date(attendance.checkIn).toLocaleTimeString()}
            </p>

            <p>
              <span className="text-muted">Check Out:</span>{" "}
              {new Date(attendance.checkOut).toLocaleTimeString()}
            </p>

            <p className="fw-semibold text-primary">
              Working Time: {attendance.workingTime}
            </p>
          </>
        )}
      </div>

      {/* MONTH SELECT */}
      <div className="card p-4 shadow-sm rounded-4 mb-4 border-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">📊 Monthly Report</h5>

          <select
            className="form-select w-auto"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                Month {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* SUMMARY */}
        {monthly && (
          <div className="d-flex gap-3 mb-3">
            <div className="p-3 bg-success-subtle rounded-3 flex-fill">
              <div className="text-success fw-bold">Total Hours</div>
              <div>{Number(monthly.totalHours || 0).toFixed(1)} h</div>
            </div>

            <div className="p-3 bg-warning-subtle rounded-3 flex-fill">
              <div className="text-warning fw-bold">Late Days</div>
              <div>{monthly.lateDays}</div>
            </div>

            <div className="p-3 bg-danger-subtle rounded-3 flex-fill">
              <div className="text-danger fw-bold">Absent Days</div>
              <div>{monthly.absentDays}</div>
            </div>
          </div>
        )}

        {/* LOADING / EMPTY */}
        {loadingMonth ? (
          <p className="text-center text-muted">Loading...</p>
        ) : !monthly ? (
          <p className="text-center text-muted">No data for this month</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Time</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>

                    <td>
                      <span
                        className={`${
                          r.status === "present"
                            ? " text-success"
                            : r.status === "late"
                              ? " text-warning"
                              : " text-danger"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td>
                      {r.checkIn
                        ? new Date(r.checkIn).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td>
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="fw-semibold text-primary">
                      {r.workingTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3 gap-2">
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
      )}
    </div>
  );
}
