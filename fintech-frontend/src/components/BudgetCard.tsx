interface BudgetProps {
    limit: number;
    spent: number;
    remaining: number;
    status: string;
    used_percentage: number;
}

export default function BudgetCard({
    limit,
    spent,
    remaining,
    status,
    used_percentage,
}: BudgetProps) {
    const progressColor =
        status === "over"
            ? "#ef4444"
            : status === "warning"
            ? "#f59e0b"
            : "#22c55e";

    return (
        <div
            style={{
                background: "#1f2937",
                padding: 24,
                borderRadius: 16,
                color: "white",
            }}
        >
            <h2>Budget Overview</h2>

            <p>Limit: ${limit}</p>
            <p>Spent: ${spent}</p>
            <p>Remaining: ${remaining}</p>

            <div
                style={{
                    background: "#374151",
                    height: 12,
                    borderRadius: 999,
                    overflow: "hidden",
                    marginTop: 16,
                }}
            >
                <div
                    style={{
                        width: `${Math.min(used_percentage, 100)}%`,
                        background: progressColor,
                        height: "100%",
                    }}
                />
            </div>

            <p style={{ marginTop: 10 }}>
                {used_percentage}% used ({status})
            </p>
        </div>
    );
}