export default function Page() {
  return <div>User Page</div>;
}

"use client";

import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
} from "@/services/users";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";

export default function Page() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    fetchUsers();
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
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
      <h1>Users</h1>
      <Table columns={columns} data={users} />
    </div>
  );
}