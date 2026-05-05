export default function AuthLayout({ children }) {
 return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        position: "relative",
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
        }}
      />

      {/* CARD */}
      <div
        className="shadow-lg"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          background: "white",
          borderRadius: "16px",
          padding: "30px",
        }}
      >
        {children}
      </div>
    </div>
  );
}