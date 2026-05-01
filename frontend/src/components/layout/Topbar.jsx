"use client";

export default function Topbar({ user }) {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      

      <div className="flex items-center gap-4 p-3">
        <span>👤 Welcome </span>
        <span className="text-primary font-bold">{user?.name}</span>     
      </div>
    </div>
  );
}