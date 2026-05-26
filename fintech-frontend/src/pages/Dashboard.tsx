import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import DailySpendingChart from "../components/charts/DailySpendingChart";
import WeeklySpendingChart from "../components/charts/WeeklySpendingChart";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import BudgetForm from "../components/budget/BudgetForm";
import CategoryForm from "../components/category/CategoryForm";

import api from "../api";
import { DashboardData, ApiResponse } from "../types/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch dashboard data
  const fetchDashboard = useCallback(() => {
    api
      .get<ApiResponse<DashboardData>>("/dashboard")
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ Loading screen
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0f172a",
          color: "white",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: 30,
        color: "white",
        fontFamily: "Arial",
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 36,
            }}
          >
            📊 Fintech Dashboard
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: 8,
            }}
          >
            Smart personal finance analytics
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            background: "#ef4444",
            border: "none",
            color: "white",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* ================= TRANSACTION FORM ================= */}
      <div style={{ marginBottom: 30 }}>
        <TransactionForm onSuccess={fetchDashboard} />
      </div>

      {/* ================= TRANSACTION LIST ================= */}
      <div style={{ marginBottom: 30 }}>
        <TransactionList />
      </div>

      {/* ================= BUDGET FORM ================= */}
      <div style={{ marginBottom: 30 }}>
        <BudgetForm onSuccess={fetchDashboard} />
      </div>

      {/* ================= CATEGORY FORM ================= */}
      <div style={{ marginBottom: 30 }}>
        <CategoryForm onSuccess={fetchDashboard} />
      </div>

      {/* ================= CHARTS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <ExpensePieChart
          data={data.category_breakdown}
        />

        <DailySpendingChart
          data={data.daily_spending}
        />

        <WeeklySpendingChart
          data={data.weekly_spending}
        />
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        {/* Balance */}
        <div
          style={{
            background: "#1e293b",
            padding: 25,
            borderRadius: 20,
          }}
        >
          <p style={{ color: "#94a3b8" }}>Balance</p>

          <h2 style={{ marginTop: 10 }}>
            ${data.summary.balance}
          </h2>
        </div>

        {/* Income */}
        <div
          style={{
            background: "#1e293b",
            padding: 25,
            borderRadius: 20,
          }}
        >
          <p style={{ color: "#94a3b8" }}>Income</p>

          <h2
            style={{
              marginTop: 10,
              color: "#22c55e",
            }}
          >
            ${data.summary.total_income}
          </h2>
        </div>

        {/* Expense */}
        <div
          style={{
            background: "#1e293b",
            padding: 25,
            borderRadius: 20,
          }}
        >
          <p style={{ color: "#94a3b8" }}>Expense</p>

          <h2
            style={{
              marginTop: 10,
              color: "#ef4444",
            }}
          >
            ${data.summary.total_expense}
          </h2>
        </div>
      </div>

      {/* ================= BUDGET + TOP CATEGORY ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        {/* Budget */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 20,
            padding: 25,
          }}
        >
          <h2 style={{ marginTop: 0 }}>💰 Budget</h2>

          {data.budget ? (
            <>
              <p>Limit: ${data.budget.limit}</p>
              <p>Spent: ${data.budget.spent}</p>
              <p>Remaining: ${data.budget.remaining}</p>

              {/* Progress Bar */}
              <div
                style={{
                  marginTop: 15,
                  background: "#334155",
                  borderRadius: 999,
                  height: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      data.budget.used_percentage,
                      100
                    )}%`,
                    height: "100%",
                    background:
                      data.budget.status === "over"
                        ? "#ef4444"
                        : data.budget.status === "warning"
                        ? "#f59e0b"
                        : "#22c55e",
                  }}
                />
              </div>

              <p style={{ marginTop: 10 }}>
                {data.budget.used_percentage}% used
              </p>
            </>
          ) : (
            <p>No budget set</p>
          )}
        </div>

        {/* Top Category */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 20,
            padding: 25,
          }}
        >
          <h2 style={{ marginTop: 0 }}>🔥 Top Category</h2>

          {data.top_category ? (
            <>
              <h3>{data.top_category.name}</h3>

              <p
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#a78bfa",
                }}
              >
                ${data.top_category.amount}
              </p>
            </>
          ) : (
            <p>No category data</p>
          )}
        </div>
      </div>

      {/* ================= RECOMMENDATIONS ================= */}
      <div
        style={{
          background: "#1e293b",
          borderRadius: 20,
          padding: 25,
          marginBottom: 30,
        }}
      >
        <h2 style={{ marginTop: 0 }}>🤖 AI Recommendations</h2>

        <ul style={{ paddingLeft: 20 }}>
          {data.recommendations.map((r, i) => (
            <li
              key={i}
              style={{
                marginBottom: 10,
                color: "#cbd5e1",
              }}
            >
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* ================= INSIGHTS ================= */}
      <div
        style={{
          background: "#1e293b",
          borderRadius: 20,
          padding: 25,
        }}
      >
        <h2 style={{ marginTop: 0 }}>📈 Insights</h2>

        <ul style={{ paddingLeft: 20 }}>
          {data.insights.map((i, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: 10,
                color: "#cbd5e1",
              }}
            >
              {i}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}