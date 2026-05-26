interface Props {
    recommendations: string[];
}

export default function RecommendationList({
    recommendations,
}: Props) {
    return (
        <div
            style={{
                background: "#1f2937",
                padding: 24,
                borderRadius: 16,
                color: "white",
            }}
        >
            <h2>🎯 Recommendations</h2>

            <ul
                style={{
                    paddingLeft: 20,
                }}
            >
                {recommendations.map((rec, index) => (
                    <li
                        key={index}
                        style={{
                            marginBottom: 10,
                            color: "#d1d5db",
                        }}
                    >
                        {rec}
                    </li>
                ))}
            </ul>
        </div>
    );
}