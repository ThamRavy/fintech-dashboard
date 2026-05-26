import { useEffect, useState } from "react";
import api from "../../api";
import "./budget.css";

type Budget = {
  id?: number;
  limit_amount: number;
  month: string;
};

type Props = {
  onSuccess?: () => void;
};

export default function BudgetForm({
  onSuccess,
}: Props) {
  const [limitAmount, setLimitAmount] =
    useState("");

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [loading, setLoading] = useState(false);

  const [existingBudget, setExistingBudget] =
    useState<Budget | null>(null);

  // ✅ Load existing budget
  useEffect(() => {
    api
      .get("/budgets")
      .then((res) => {
        const budgets = res.data.data || [];

        const currentBudget = budgets.find(
          (b: Budget) =>
            b.month.slice(0, 7) === month
        );

        if (currentBudget) {
          setExistingBudget(currentBudget);

          setLimitAmount(
            String(currentBudget.limit_amount)
          );
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [month]);

  // ✅ Submit budget
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (existingBudget?.id) {
        // UPDATE
        await api.put(
          `/budgets/${existingBudget.id}`,
          {
            limit_amount: Number(limitAmount),
            month: `${month}-01`,
          }
        );

        alert("Budget updated");
      } else {
        // CREATE
        await api.post("/budgets", {
          limit_amount: Number(limitAmount),
          month: `${month}-01`,
        });

        alert("Budget created");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Budget save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-card">
      <h2>💰 Monthly Budget</h2>

      <form
        onSubmit={handleSubmit}
        className="budget-form"
      >
        {/* Month */}
        <div className="budget-group">
          <label>Month</label>

          <input
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
            required
          />
        </div>

        {/* Budget Amount */}
        <div className="budget-group">
          <label>Budget Limit</label>

          <input
            type="number"
            placeholder="Enter budget amount"
            value={limitAmount}
            onChange={(e) =>
              setLimitAmount(e.target.value)
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : existingBudget
            ? "Update Budget"
            : "Create Budget"}
        </button>
      </form>
    </div>
  );
}