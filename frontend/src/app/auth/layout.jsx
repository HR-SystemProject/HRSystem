//  Layout for auth pages
//  Simple UI (no sidebar/topbar)
export default function AuthLayout({ children }) {
  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #0d6efd, #6ea8fe)",
      }}
    >
      <div
        className="bg-white p-4 rounded shadow transition-card"
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {children}
      </div>
    </div>
  );
}