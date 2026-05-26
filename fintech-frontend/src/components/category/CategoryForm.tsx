import { useCallback, useEffect, useState } from "react";
import api from "../../api";
import "./category.css";

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};

type Props = {
  onSuccess?: () => void;
};

export default function CategoryForm({
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<
    "income" | "expense"
  >("expense");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(false);

  // ✅ Load categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get(
        "/categories"
      );

      setCategories(
        res.data.data || []
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          "/categories"
        );

        setCategories(
          res.data.data || []
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // ✅ Quick presets
  const incomePresets = [
    "Salary",
    "Freelance",
    "Investment",
    "Business",
    "Bonus",
  ];

  const expensePresets = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
  ];

  // ✅ Create category
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // prevent duplicate names
    const exists = categories.some(
      (c) =>
        c.name.toLowerCase() ===
          name.toLowerCase() &&
        c.type === type
    );

    if (exists) {
      alert(
        "Category already exists"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/categories",
        {
          name,
          type: type.toUpperCase(),
        }
      );

      alert("Category created");

      setName("");
      setType("expense");

      await loadCategories();

      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(
        "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete category
  const deleteCategory = async (
    id: number
  ) => {
    const confirmDelete = confirm(
      "Delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/categories/${id}`
      );

      setCategories((prev) =>
        prev.filter(
          (c) => c.id !== id
        )
      );
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ✅ Current preset list
  const presets =
    type === "income"
      ? incomePresets
      : expensePresets;

  return (
    <div className="category-card">
      <h2>
        🏷 Manage Categories
      </h2>

      {/* CREATE FORM */}
      <form
        onSubmit={handleSubmit}
        className="category-form"
      >
        {/* Name */}
        <div className="category-group">
          <label>
            Category Name
          </label>

          <input
            type="text"
            placeholder="e.g. Food"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            required
          />
        </div>

        {/* Type */}
        <div className="category-group">
          <label>Type</label>

          <select
            value={type}
            onChange={(e) =>
              setType(
                e.target.value as
                  | "income"
                  | "expense"
              )
            }
          >
            <option value="expense">
              💸 expense
            </option>

            <option value="income">
              💰 income
            </option>
          </select>
        </div>

        {/* Presets */}
        <div className="category-group">
          <label>
            Quick Categories
          </label>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            {presets.map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setName(preset)
                  }
                  style={{
                    padding:
                      "8px 14px",
                    borderRadius: 10,
                    border:
                      "1px solid #475569",
                    background:
                      "#0f172a",
                    color: "white",
                    cursor:
                      "pointer",
                  }}
                >
                  {preset}
                </button>
              )
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            loading || !name
          }
        >
          {loading
            ? "Creating..."
            : "Create Category"}
        </button>
      </form>

      {/* CATEGORY LIST */}
      <div className="category-list">
        {categories.length ===
        0 ? (
          <p className="empty-text">
            No categories found
          </p>
        ) : (
          categories.map(
            (category) => (
              <div
                key={category.id}
                className="category-item"
              >
                <div>
                  <h3>
                    {category.name}
                  </h3>

                  <span
                    className={
                      category.type ===
                      "income"
                        ? "income-badge"
                        : "expense-badge"
                    }
                  >
                    {category.type}
                  </span>
                </div>

                <button
                  onClick={() =>
                    deleteCategory(
                      category.id
                    )
                  }
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}