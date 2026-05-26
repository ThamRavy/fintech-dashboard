interface Props {
    title: string;
    value: number;
    color?: string;
}

export default function SummaryCard({
    title,
    value,
    color = "#6366f1",
}: Props) {
    return (
        <div
            style={{
                background: "#1f2937",
                padding: 24,
                borderRadius: 16,
                color: "white",
                flex: 1,
                minWidth: 220,
            }}
        >
            <p
                style={{
                    color: "#9ca3af",
                    marginBottom: 10,
                }}
            >
                {title}
            </p>

            <h2
                style={{
                    margin: 0,
                    color,
                }}
            >
                ${value}
            </h2>
        </div>
    );
}
