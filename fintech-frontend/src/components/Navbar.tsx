import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div
            style={{
                background: "#111827",
                padding: "16px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "white",
                borderBottom: "1px solid #1f2937",
            }}
        >
            <h2 style={{ margin: 0 }}>💰 FinTrack AI</h2>

            <button
                onClick={logout}
                style={{
                    background: "#ef4444",
                    border: "none",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: "bold",
                }}
            >
                Logout
            </button>
        </div>
    );
}