import { useEffect, useState } from "react";
import api from "../../api";

type Transaction = {
    id: number;
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
    category?: {
        id: number;
        name: string;
    };
};

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get("/transactions");

                setTransactions(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // ✅ Delete transaction
    const deleteTransaction = async (id: number) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/transactions/${id}`);

            setTransactions((prev) =>
                prev.filter((t) => t.id !== id)
            );
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    background: "#1e293b",
                    borderRadius: 20,
                    padding: 25,
                    color: "white",
                }}
            >
                Loading transactions...
            </div>
        );
    }

    return (
        <div
            style={{
                background: "#1e293b",
                borderRadius: 20,
                padding: 25,
                marginBottom: 30,
            }}
        >
            <h2
                style={{
                    marginTop: 0,
                    marginBottom: 20,
                    color: "white",
                }}
            >
                💳 Latest Transactions
            </h2>

            {transactions.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>
                    No transactions found
                </p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 15,
                    }}
                >
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            style={{
                                background: "#0f172a",
                                borderRadius: 16,
                                padding: 18,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 15,
                            }}
                        >
                            {/* LEFT */}
                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        color: "white",
                                    }}
                                >
                                    {transaction.description || "No description"}
                                </h3>

                                <p
                                    style={{
                                        marginTop: 8,
                                        marginBottom: 8,
                                        color: "#94a3b8",
                                        fontSize: 14,
                                    }}
                                >
                                    {transaction.date}
                                </p>

                                {/* Category Badge */}
                                <span
                                    style={{
                                        background: "#334155",
                                        color: "#cbd5e1",
                                        padding: "6px 12px",
                                        borderRadius: 999,
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                                    {transaction.category?.name || "Other"}
                                </span>
                            </div>

                            {/* RIGHT */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 15,
                                }}
                            >
                                {/* Amount */}
                                <div
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color:
                                            transaction.type === "income"
                                                ? "#22c55e"
                                                : "#ef4444",
                                    }}
                                >
                                    {transaction.type === "income" ? "+" : "-"}$
                                    {transaction.amount}
                                </div>

                                {/* Edit Button */}
                                <button
                                    style={{
                                        background: "#3b82f6",
                                        border: "none",
                                        color: "white",
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        fontWeight: 700,
                                    }}
                                >
                                    Edit
                                </button>

                                {/* Delete Button */}
                                <button
                                    onClick={() =>
                                        deleteTransaction(transaction.id)
                                    }
                                    style={{
                                        background: "#ef4444",
                                        border: "none",
                                        color: "white",
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        fontWeight: 700,
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}