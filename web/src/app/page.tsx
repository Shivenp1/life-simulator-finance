"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  type ChartOptions,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip);

// Color palette for datasets
const COLORS = {
  net: "#2563eb",        // blue
  cash: "#059669",       // green
  portfolio: "#f59e0b",  // amber
  debt: "#ef4444",       // red
};

type Monthly = { month: number; cash: number; portfolio: number; debt: number; netWorth: number };
type Result = {
  inputs: any;
  checkpoints: { final: { cash: number; portfolio: number; debt: number; netWorth: number } };
  monthly: Monthly[];
  summary: string;
};

export default function Page() {
  const [form, setForm] = useState({
    months: 120,
    startingCash: 30000,
    monthlyInvest: 400,
    returnAnnual: 6,
    loanBalance: 20000,
    loanRateAnnual: 5,
    loanMinPayment: 220,
    loanExtraPayment: 0,
  });
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const api = "http://localhost:8080/simulate"; // backend

  // helper to render labeled numeric inputs
  const input = (label: string, key: keyof typeof form) => (
    <label key={String(key)} className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        type="number"
        value={form[key] as number}
        onChange={(e) => setForm((s) => ({ ...s, [key]: Number(e.target.value) }))}
        className="p-2 border rounded"
      />
    </label>
  );

  async function run() {
    setLoading(true);
    const qs = new URLSearchParams(Object.entries(form as any)).toString();
    const r = await fetch(`${api}?${qs}`);
    const j = (await r.json()) as Result;
    setRes(j);
    setLoading(false);
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labels = res?.monthly.map((m) => m.month) ?? [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Net Worth",
        data: res?.monthly.map((m) => m.netWorth) ?? [],
        borderColor: COLORS.net,
        backgroundColor: COLORS.net + "33",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
      },
      {
        label: "Cash",
        data: res?.monthly.map((m) => m.cash) ?? [],
        borderColor: COLORS.cash,
        backgroundColor: COLORS.cash + "33",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
      },
      {
        label: "Portfolio",
        data: res?.monthly.map((m) => m.portfolio) ?? [],
        borderColor: COLORS.portfolio,
        backgroundColor: COLORS.portfolio + "33",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
      },
      {
        label: "Debt",
        data: res?.monthly.map((m) => m.debt) ?? [],
        borderColor: COLORS.debt,
        backgroundColor: COLORS.debt + "33",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}`,
        },
      },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 12 } },
      y: {
        ticks: {
          callback: (value) =>
            typeof value === "number" ? value.toLocaleString() : String(value),
        },
      },
    },
  };

  return (
    <main className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-2">Life Event Financial Simulator</h1>
      <p className="text-gray-600 mb-4">
        Edit inputs and run the simulation. Data comes from your Java backend at <code>:8080</code>.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {input("Months", "months")}
        {input("Starting Cash ($)", "startingCash")}
        {input("Monthly Invest ($)", "monthlyInvest")}
        {input("Annual Return (%)", "returnAnnual")}
        {input("Loan Balance ($)", "loanBalance")}
        {input("Loan Rate (%)", "loanRateAnnual")}
        {input("Loan Min Payment ($)", "loanMinPayment")}
        {input("Loan Extra Payment ($)", "loanExtraPayment")}
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Running..." : "Run Simulation"}
      </button>

      {res && (
        <>
          <div className="flex flex-wrap gap-6 mt-6 text-lg">
            <div>
              Final Net Worth: <b>${res.checkpoints.final.netWorth.toLocaleString()}</b>
            </div>
            <div>Cash: <b>${res.checkpoints.final.cash.toLocaleString()}</b></div>
            <div>
              Portfolio: <b>${res.checkpoints.final.portfolio.toLocaleString()}</b>
            </div>
            <div>Debt: <b>${res.checkpoints.final.debt.toLocaleString()}</b></div>
          </div>

          <div className="mt-6 bg-white p-4 rounded shadow">
            <Line data={chartData} options={chartOptions} />
          </div>

          <p className="mt-4 text-gray-700">{res.summary}</p>
        </>
      )}
    </main>
  );
}
