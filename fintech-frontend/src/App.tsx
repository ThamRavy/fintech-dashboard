import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {ReactNode} from "react";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// 🔐 Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// 🔐 Protected route
function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated()
    ? children
    : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* login */}
        <Route
          path="/login"
          element={
            !isAuthenticated()
              ? <Login />
              : <Navigate to="/" />
          }
        />
        {/* register */}
        <Route
          path="/register"
          element={
            !isAuthenticated()
              ? <Register />
              : <Navigate to="/" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
