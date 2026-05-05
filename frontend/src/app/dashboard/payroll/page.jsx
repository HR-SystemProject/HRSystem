

"use client";

import { useEffect, useState } from "react";
import { getPayrolls } from "../../../services/payroll";

import { FaSearch } from "react-icons/fa";

export default function Page() {
const [payrolls, setPayrolls] = useState([]);
const [filtered, setFiltered] = useState([]);

const [search, setSearch] = useState("");
const [month, setMonth] = useState("");

// pagination
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;

useEffect(() => {
fetchPayrolls();
}, []);

useEffect(() => {
filterData();
}, [search, month, payrolls]);

const fetchPayrolls = async () => {
try {
const res = await getPayrolls();
setPayrolls(res.data.data);
setFiltered(res.data.data);
} catch (err) {
console.log(err);
}
};

const filterData = () => {
let data = [...payrolls];

```
// 🔍 search by employee name
if (search) {
  data = data.filter((p) =>
    p.employeeId?.userId?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );
}

//  filter by month
if (month) {
  data = data.filter((p) => p.month === month);
}

setFiltered(data);
setCurrentPage(1);
```

};

// pagination logic
const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentData = filtered.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(filtered.length / itemsPerPage);

return ( <div className="container py-5"> <h3 className="fw-bold mb-4">Payroll Management</h3>


  {/*  Filters */}
  <div className="row mb-4 g-2">
    <div className="col-md-6">
      <div className="input-group">
        <span className="input-group-text">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search by employee name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>

    <div className="col-md-3">
      <input
        type="month"
        className="form-control"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />
    </div>

    <div className="col-md-3">
      <button
        className="btn btn-outline-secondary w-100"
        onClick={() => {
          setSearch("");
          setMonth("");
        }}
      >
        Reset
      </button>
    </div>
  </div>

  {/* Cards */}
  <div className="row g-3">
    {currentData.map((p) => (
      <div key={p._id} className="col-md-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body d-flex flex-column">
            <div className="d-flex justify-content-between">
              <h5 className="fw-semibold">
                {p.employeeId?.userId?.name || "Employee"}
              </h5>

              <span
                className={`badge ${
                  p.status === "paid" ? "bg-success" : "bg-warning"
                }`}
              >
                {p.status}
              </span>
            </div>

            <small className="text-muted">{p.month}</small>

            <div className="mt-3">
              <div>Base: {p.baseSalary}</div>
              <div>Bonus: {p.bonus || 0}</div>
              <div>Deduction: {p.deductions || 0}</div>
              <hr />
              <strong>Net: {p.netSalary}</strong>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/*  Pagination */}
  {totalPages > 1 && (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">

        <li className={`page-item ${currentPage === 1 && "disabled"}`}>
          <button
            className="page-link"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>
        </li>

        {[...Array(totalPages)].map((_, i) => (
          <li
            key={i}
            className={`page-item ${
              currentPage === i + 1 ? "active" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          </li>
        ))}

        <li
          className={`page-item ${
            currentPage === totalPages && "disabled"
          }`}
        >
          <button
            className="page-link"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </li>

      </ul>
    </nav>
  )}
</div>


);
}
