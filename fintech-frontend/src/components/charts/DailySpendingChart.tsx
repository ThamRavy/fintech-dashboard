import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: {
    date: string;
    amount: number;
  }[];
};

export default function DailySpendingChart({
  data,
}: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 20,
        padding: 25,
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        📈 Daily Spending
      </h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#334155" />

            <XAxis
              dataKey="date"
              stroke="#cbd5e1"
            />

            <YAxis stroke="#cbd5e1" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8b5cf6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}