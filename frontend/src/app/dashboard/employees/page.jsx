{showModal && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{
      background: "rgba(0,0,0,0.6)",
      zIndex: 9999,
      backdropFilter: "blur(3px)",
    }}
    onClick={() => setShowModal(false)}
  >
    {/* Prevent closing when clicking inside modal */}
    <div
      className="bg-white p-4 rounded shadow transition-card"
      style={{
        width: "520px",
        maxWidth: "95%",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0">Create Employee</h5>

        <button
          className="btn-close"
          onClick={() => setShowModal(false)}
        />
      </div>

      {/* Job Title */}
      <input
        name="jobTitle"
        placeholder="Job Title"
        className="form-control mb-2"
        onChange={handleChange}
      />

      {/* Salary with validation hint */}
      <input
        name="salary"
        type="number"
        placeholder="Salary"
        className="form-control mb-1"
        onChange={(e) => {
          const value = e.target.value;
          if (value < 0) {
            alert("Salary cannot be negative");
            return;
          }
          handleChange(e);
        }}
      />
      <small className="text-muted mb-2 d-block">
        Salary must be a positive number
      </small>

      {/* Phone */}
      <input
        name="phone"
        placeholder="Phone"
        className="form-control mb-2"
        onChange={handleChange}
      />

      {/* Department dropdown */}
      <select
        name="departmentId"
        className="form-select mb-3"
        onChange={handleChange}
      >
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        name="status"
        className="form-select mb-3"
        onChange={handleChange}
        defaultValue="active"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Buttons */}
      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-success btn-sm"
          onClick={handleCreateEmployee}
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}