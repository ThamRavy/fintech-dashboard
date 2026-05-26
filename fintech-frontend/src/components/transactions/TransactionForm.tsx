import { useEffect, useState } from "react";
import api from "../../api";
import "./transaction.css";

interface Category {
  id: number;
  name: string;
  type: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({
  onSuccess,
}: TransactionFormProps) {
  // ================= STATES =================
  const [amount, setAmount] =
    useState("");

  const [type, setType] =
    useState("expense");

  const [categoryId, setCategoryId] =
    useState("");

  const [
    customCategory,
    setCustomCategory,
  ] = useState("");

  const [date, setDate] = useState("");

  const [description, setDescription] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(false);

  // ================= LOAD CATEGORIES =================
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load categories");
      });
  }, []);

  // ================= FILTER CATEGORIES =================
  const filteredCategories =
    categories.filter(
      (c) => c.type === type
    );

  // ================= SUBMIT =================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Validate category
    if (
      !categoryId &&
      !customCategory.trim()
    ) {
      alert(
        "Please select or type a category"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/transactions", {
        amount: Number(amount),

        type,

        category_id: categoryId
          ? Number(categoryId)
          : null,

        custom_category:
          customCategory,

        date,

        description,
      });

      alert(
        "Transaction added successfully"
      );

      // ================= RESET FORM =================
      setAmount("");

      setType("expense");

      setCategoryId("");

      setCustomCategory("");

      setDate("");

      setDescription("");

      // Refresh dashboard
      onSuccess?.();

    } catch (err) {
      console.error(err);

      alert(
        "Failed to add transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form-card">
      <h2>➕ Add Transaction</h2>

      <form
        onSubmit={handleSubmit}
        className="transaction-form"
      >
        {/* ================= AMOUNT ================= */}
        <div className="form-group">
          <label>Amount</label>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            required
          />
        </div>

        {/* ================= TYPE ================= */}
        <div className="form-group">
          <label>Type</label>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);

              // reset category
              setCategoryId("");

              setCustomCategory("");
            }}
          >
            <option value="expense">
              💸 expense
            </option>

            <option value="income">
              💰 income
            </option>
          </select>
        </div>

        {/* ================= CATEGORY ================= */}
        <div className="form-group">
          <label>Category</label>

          {/* Dropdown */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(
                e.target.value
              );

              // clear manual input if dropdown selected
              if (e.target.value) {
                setCustomCategory("");
              }
            }}
          >
            <option value="">
              Select category
            </option>

            {filteredCategories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.type ===
                  "income"
                    ? "💰"
                    : "💸"}{" "}
                  {category.name}
                </option>
              )
            )}
          </select>

          {/* Manual input */}
          <input
            type="text"
            placeholder="Or type custom category"
            value={customCategory}
            disabled={!!categoryId}
            onChange={(e) => {
              setCustomCategory(
                e.target.value
              );

              // clear dropdown if typing manually
              if (
                e.target.value
              ) {
                setCategoryId("");
              }
            }}
            style={{
              marginTop: 12,
            }}
          />

          {/* Empty state */}
          {filteredCategories.length ===
            0 && (
            <p
              style={{
                color: "#f87171",
                marginTop: 8,
                fontSize: 14,
              }}
            >
              No {type} categories
              found.
            </p>
          )}

          {/* Count */}
          <p
            style={{
              marginTop: 8,
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            {
              filteredCategories.length
            }{" "}
            categories available
          </p>
        </div>

        {/* ================= DATE ================= */}
        <div className="form-group">
          <label>Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />
        </div>

        {/* ================= DESCRIPTION ================= */}
        <div className="form-group">
          <label>Description</label>

          <textarea
            placeholder="Optional description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />
        </div>

        {/* ================= SUBMIT ================= */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}