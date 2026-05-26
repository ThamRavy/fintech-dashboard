import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../api";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/");
        }
    }, [navigate]);

    const register = async () => {
        try {
            setLoading(true);

            await api.post("/register", {
                name,
                email,
                password,
                password_confirmation: password,
            });

            alert("Registered successfully");

            navigate("/login");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || "Register failed");
            } else {
                alert("Unexpected error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0f172a",
                padding: 20,
            }}
        >
            <div
                style={{
                    width: 400,
                    background: "white",
                    borderRadius: 20,
                    padding: 40,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
            >
                <div style={{ marginBottom: 30 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 32,
                            color: "#111827",
                        }}
                    >
                        Create Account 🚀
                    </h1>

                    <p
                        style={{
                            color: "#6b7280",
                            marginTop: 10,
                        }}
                    >
                        Start managing your finances smarter.
                    </p>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontWeight: 600,
                        }}
                    >
                        Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                            width: "100%",
                            padding: 14,
                            borderRadius: 12,
                            border: "1px solid #d1d5db",
                            fontSize: 16,
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontWeight: 600,
                        }}
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{
                            width: "100%",
                            padding: 14,
                            borderRadius: 12,
                            border: "1px solid #d1d5db",
                            fontSize: 16,
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 25 }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontWeight: 600,
                        }}
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        style={{
                            width: "100%",
                            padding: 14,
                            borderRadius: 12,
                            border: "1px solid #d1d5db",
                            fontSize: 16,
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <button
                    onClick={register}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        borderRadius: 12,
                        border: "none",
                        background: "#7c3aed",
                        color: "white",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p
                    style={{
                        marginTop: 20,
                        textAlign: "center",
                        color: "#6b7280",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: "#7c3aed",
                            fontWeight: 700,
                            textDecoration: "none",
                        }}
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}