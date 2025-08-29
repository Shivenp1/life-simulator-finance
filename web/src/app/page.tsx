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

// Enhanced color palette
const COLORS = {
  net: "#2563eb",        // blue
  cash: "#059669",       // green
  portfolio: "#f59e0b",  // amber
  debt: "#ef4444",       // red
  home: "#8b5cf6",       // purple
  car: "#ec4899",        // pink
};

type Monthly = { 
  month: number; 
  cash: number; 
  portfolio: number; 
  debt: number; 
  netWorth: number;
  narrative: string;
};

type Result = {
  inputs: any;
  checkpoints: { 
    final: { 
      cash: number; 
      portfolio: number; 
      debt: number; 
      netWorth: number;
      homeEquity: number;
      carValue: number;
    };
    mid: {
      cash: number;
      portfolio: number;
      debt: number;
      netWorth: number;
      homeEquity: number;
      carValue: number;
    };
  };
  monthly: Monthly[];
  summary: string;
  lifeEvents: string[];
  recommendations: string[];
};

export default function Page() {
  const [form, setForm] = useState({
    // Basic parameters
    months: 120,
    startingCash: 50000,
    monthlyInvest: 500,
    returnAnnual: 7,
    salaryAnnual: 70000,
    monthlyExpenses: 2000,
    
    // Existing loan
    loanBalance: 25000,
    loanRateAnnual: 5,
    loanMinPayment: 300,
    loanExtraPayment: 100,
    
    // House event
    houseBuyMonth: 12,
    homePrice: 350000,
    downPaymentPercent: 20,
    mortgageRate: 6.5,
    
    // Car event
    carBuyMonth: 24,
    carPrice: 30000,
    carDownPaymentPercent: 10,
    carLoanRate: 7.0,
    carLoanYears: 5,
    
    // Education event
    collegeStartMonth: 36,
    studentLoanAmount: 50000,
    studentLoanRate: 5.0,
    studentLoanYears: 10,
  });
  
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inputs' | 'results' | 'events' | 'recommendations'>('inputs');
  const api = "http://localhost:8080/simulate";

  // Enhanced input helper with better styling
  const input = (label: string, key: keyof typeof form, placeholder?: string, type: string = "number") => (
    <label key={String(key)} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={form[key] as number}
        onChange={(e) => setForm((s) => ({ ...s, [key]: Number(e.target.value) }))}
        placeholder={placeholder}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </label>
  );

  async function run() {
    setLoading(true);
    try {
      const qs = new URLSearchParams(Object.entries(form as any)).toString();
      const r = await fetch(`${api}?${qs}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as Result;
      setRes(j);
      setActiveTab('results');
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed. Make sure your Java backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
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
        backgroundColor: COLORS.net + "20",
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 0,
        fill: true,
      },
      {
        label: "Cash",
        data: res?.monthly.map((m) => m.cash) ?? [],
        borderColor: COLORS.cash,
        backgroundColor: COLORS.cash + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Portfolio",
        data: res?.monthly.map((m) => m.portfolio) ?? [],
        borderColor: COLORS.portfolio,
        backgroundColor: COLORS.portfolio + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Home Equity",
        data: res?.monthly.map((m) => res?.checkpoints.mid.homeEquity ?? 0) ?? [],
        borderColor: COLORS.home,
        backgroundColor: COLORS.home + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Car Value",
        data: res?.monthly.map((m) => res?.checkpoints.mid.carValue ?? 0) ?? [],
        borderColor: COLORS.car,
        backgroundColor: COLORS.car + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Total Debt",
        data: res?.monthly.map((m) => m.debt) ?? [],
        borderColor: COLORS.debt,
        backgroundColor: COLORS.debt + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { 
        labels: { 
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        },
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${Number(ctx.parsed.y).toLocaleString()}`,
        },
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: { 
        ticks: { maxTicksLimit: 12 },
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      y: {
        ticks: {
          callback: (value) =>
            typeof value === "number" ? `$${value.toLocaleString()}` : String(value),
        },
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2"></h1>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Life Event Financial Simulator</h1>
          <p className="text-xl text-gray-600">
            See how major life purchases cascade and affect your wealth-building journey
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6">
          {[
            { id: 'inputs', label: ' Inputs', icon: '⚙️' },
            { id: 'results', label: '📈 Results', icon: '📊' },
            { id: 'events', label: ' Life Events', icon: '🎯' },
            { id: 'recommendations', label: ' Smart Tips', icon: '' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'inputs' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Simulation Parameters</h2>
            
            {/* Basic Parameters */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                💰 Basic Financial Setup
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {input("Simulation Length (months)", "months")}
                {input("Starting Cash ($)", "startingCash")}
                {input("Monthly Investment ($)", "monthlyInvest")}
                {input("Annual Return (%)", "returnAnnual")}
                {input("Annual Salary ($)", "salaryAnnual")}
                {input("Monthly Expenses ($)", "monthlyExpenses")}
              </div>
            </div>

            {/* Existing Loans */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🏦 Existing Student Loans
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {input("Loan Balance ($)", "loanBalance")}
                {input("Interest Rate (%)", "loanRateAnnual")}
                {input("Min Payment ($)", "loanMinPayment")}
                {input("Extra Payment ($)", "loanExtraPayment")}
              </div>
            </div>

            {/* House Purchase */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🏠 House Purchase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {input("Buy Month", "houseBuyMonth", "0 = never")}
                {input("Home Price ($)", "homePrice")}
                {input("Down Payment (%)", "downPaymentPercent")}
                {input("Mortgage Rate (%)", "mortgageRate")}
              </div>
            </div>

            {/* Car Purchase */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🚗 Car Purchase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {input("Buy Month", "carBuyMonth", "0 = never")}
                {input("Car Price ($)", "carPrice")}
                {input("Down Payment (%)", "carDownPaymentPercent")}
                {input("Loan Rate (%)", "carLoanRate")}
                {input("Loan Years", "carLoanYears")}
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🎓 Education Financing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {input("Start Month", "collegeStartMonth", "0 = never")}
                {input("Loan Amount ($)", "studentLoanAmount")}
                {input("Interest Rate (%)", "studentLoanRate")}
                {input("Repayment Years", "studentLoanYears")}
              </div>
            </div>

            <button
              onClick={run}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? " Running Simulation..." : "🚀 Run Life Event Simulation"}
            </button>
          </div>
        )}

        {activeTab === 'results' && res && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Final Net Worth", value: res.checkpoints.final.netWorth, color: "text-blue-600" },
                { label: "Final Cash", value: res.checkpoints.final.cash, color: "text-green-600" },
                { label: "Final Portfolio", value: res.checkpoints.final.portfolio, color: "text-amber-600" },
                { label: "Total Assets", value: res.checkpoints.final.netWorth + res.checkpoints.final.debt, color: "text-purple-600" },
              ].map((metric) => (
                <div key={metric.label} className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">{metric.label}</div>
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    ${metric.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Journey Over Time</h3>
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Simulation Summary</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{res.summary}</p>
            </div>
          </div>
        )}

        {activeTab === 'events' && res && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Life Events Timeline</h2>
            {res.lifeEvents.length > 0 ? (
              <div className="space-y-4">
                {res.lifeEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="text-blue-600 text-xl">🎯</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No life events scheduled in this simulation.</p>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && res && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Smart Financial Recommendations</h2>
            {res.recommendations.length > 0 ? (
              <div className="space-y-4">
                {res.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="text-green-600 text-xl">💡</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No recommendations available.</p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {res && (
          <div className="fixed bottom-6 right-6 space-y-3">
            <button
              onClick={() => setActiveTab('inputs')}
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
              title="Edit Parameters"
            >
              ⚙️
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all"
              title="View Results"
            >
              📊
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
