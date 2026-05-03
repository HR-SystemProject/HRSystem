"use client";

import { useEffect, useState } from "react";
import {
  getAllEmployees,
  deleteEmployee,
} from "@/services/employees";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";

export default function Page() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const data = await getAllEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    fetchEmployees();
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "position", label: "Position" },
    {
      key: "_id",
      label: "Actions",
      render: (id) => (
        <button onClick={() => handleDelete(id)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1>Employees</h1>
      <Table columns={columns} data={employees} />
    </div>
  );
}