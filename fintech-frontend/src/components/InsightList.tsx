interface Props {
    insights: string[];
}

export default function InsightList({ insights }: Props) {
    return (
        <div
            style={{
                background: "#1f2937",
                padding: 24,
                borderRadius: 16,
                color: "white",
            }}
        >
            <h2>🧠 AI Insights</h2>

            <ul
                style={{
                    paddingLeft: 20,
                }}
            >
                {insights.map((insight, index) => (
                    <li
                        key={index}
                        style={{
                            marginBottom: 10,
                            color: "#d1d5db",
                        }}
                    >
                        {insight}
                    </li>
                ))}
            </ul>
        </div>
    );
}