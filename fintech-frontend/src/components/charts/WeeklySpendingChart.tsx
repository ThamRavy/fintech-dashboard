import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: {
    week: string;
    amount: number;
  }[];
};

export default function WeeklySpendingChart({
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
        📊 Weekly Spending
      </h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#334155" />

            <XAxis
              dataKey="week"
              stroke="#cbd5e1"
            />

            <YAxis stroke="#cbd5e1" />

            <Tooltip />

            <Bar
              dataKey="amount"
              fill="#6366f1"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}