// web/src/app/OptimizationTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale } from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale);

type GameMode = 'game' | 'serious';

interface Debt {
  id: string;
  name: string;
  balance: number;     // $
  apr: number;         // e.g., 0.199 for 19.9%
  minPayment: number;  // $
  maxPayment?: number; // optional cap
}

interface OptimizationTabProps {
  monthlyBudget: number; // availableMonthlyIncome from parent
  gameMode: GameMode;
}

type GlpkModule = any;

export const OptimizationTab = ({ monthlyBudget, gameMode }: OptimizationTabProps) => {
  const [glpk, setGlpk] = useState<GlpkModule | null>(null);
  const [loadingSolver, setLoadingSolver] = useState(false);

  const [debts, setDebts] = useState<Debt[]>([
    { id: "cc1", name: "Credit Card", balance: 2500, apr: 0.219, minPayment: 50 },
    { id: "loan", name: "Student Loan", balance: 12000, apr: 0.055, minPayment: 120 },
  ]);

  const [enforceEmergencyFund, setEnforceEmergencyFund] = useState(true);
  const [emergencyFundMin, setEmergencyFundMin] = useState(200); // minimum required to savings
  const [sweepPoints, setSweepPoints] = useState(11);

  const canOptimize = monthlyBudget > 0 && debts.length > 0 && glpk;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingSolver(true);
      try {
        const mod = await import("glpk-wasm");
        if (mounted) setGlpk(await mod.default());
      } finally {
        if (mounted) setLoadingSolver(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const inputClass = "w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium";

  const addDebt = () => {
    setDebts((d) => [
      ...d,
      { id: `d${d.length + 1}`, name: `Debt ${d.length + 1}`, balance: 1000, apr: 0.15, minPayment: 25 },
    ]);
  };

  const removeDebt = (id: string) => setDebts((d) => d.filter(x => x.id !== id));

  // Build LP for a given weight w in [0,1]:
  // Minimize: w * totalMonthlyInterest - (1 - w) * savings
  // totalMonthlyInterest ≈ sum_i (apr_i/12 * balance_i) - sum_i (apr_i/24 * pay_i)  // linearized average-balance interest
  // Constraints:
  // - sum_i pay_i + savings = monthlyBudget
  // - pay_i >= min_i
  // - pay_i <= min(balance_i, max_i?)  // optional cap and cannot exceed balance
  // - savings >= emergencyFundMin (if enabled)
  type SolveResult = {
    ok: boolean;
    w: number;
    interest: number;
    savings: number;
    payments: Record<string, number>;
    objective: number;
  };

  const solveLP = (w: number): SolveResult | null => {
    if (!glpk) return null;

    const vars = [
      ...debts.map(d => ({ key: `pay_${d.id}` })),
      { key: "savings" }
    ];

    const nameToIndex: Record<string, number> = {};
    vars.forEach((v, i) => nameToIndex[v.key] = i + 1);

    const Aeq: { ind: number[]; val: number[] } = { ind: [], val: [] };
    const rhsEq: number[] = [monthlyBudget];

    // sum pay_i + savings == budget
    debts.forEach(d => {
      Aeq.ind.push(nameToIndex[`pay_${d.id}`]);
      Aeq.val.push(1);
    });
    Aeq.ind.push(nameToIndex["savings"]);
    Aeq.val.push(1);

    const lb: number[] = new Array(vars.length).fill(0);
    const ub: number[] = new Array(vars.length).fill(Number.POSITIVE_INFINITY);

    debts.forEach((d, idx) => {
      lb[idx] = Math.max(0, d.minPayment);
      ub[idx] = Math.max(lb[idx], Math.min(d.balance, d.maxPayment ?? Number.POSITIVE_INFINITY));
    });

    const savingsIdx = nameToIndex["savings"] - 1;
    lb[savingsIdx] = enforceEmergencyFund ? Math.max(0, emergencyFundMin) : 0;

    // Objective coefficients: w*(apr/12*bal) - w*(apr/24)*pay_i  - (1-w)*savings
    const c: number[] = new Array(vars.length).fill(0);
    let constant = 0;
    debts.forEach((d, i) => {
      constant += w * (d.apr / 12) * d.balance;
      c[i] += -w * (d.apr / 24); // coefficient on pay_i
    });
    c[savingsIdx] = -(1 - w);

    const glp = glpk;
    const m = glp.glp_create_prob();
    glp.glp_set_obj_dir(m, glp.GLP_MIN);

    glp.glp_add_rows(m, 1);
    glp.glp_set_row_name(m, 1, "budget");
    glp.glp_set_row_bnds(m, 1, glp.GLP_FX, rhsEq[0], rhsEq[0]);

    glp.glp_add_cols(m, vars.length);
    vars.forEach((v, j) => {
      glp.glp_set_col_name(m, j + 1, v.key);
      glp.glp_set_col_bnds(m, j + 1, glp.GLP_DB, lb[j], ub[j]);
      glp.glp_set_obj_coef(m, j + 1, c[j]);
    });

    const ia = [0], ja = [0], ar = [0];
    for (let k = 0; k < Aeq.ind.length; k++) {
      ia.push(1);
      ja.push(Aeq.ind[k]);
      ar.push(Aeq.val[k]);
    }
    glp.glp_load_matrix(m, Aeq.ind.length, ia, ja, ar);

    const smcp = new glp.SMCP({ presolve: glp.GLP_ON });
    const ret = glp.glp_simplex(m, smcp);

    if (ret !== 0) {
      glp.glp_delete_prob(m);
      return { ok: false, w, interest: 0, savings: 0, payments: {}, objective: 0 };
    }

    const obj = glp.glp_get_obj_val(m) + constant;
    const payments: Record<string, number> = {};
    debts.forEach((d, i) => {
      payments[d.id] = glp.glp_get_col_prim(m, i + 1);
    });
    const savings = glp.glp_get_col_prim(m, savingsIdx + 1);

    // Compute realized linearized interest
    const interest = debts.reduce((acc, d, i) => {
      const p = payments[d.id];
      return acc + (d.apr / 12) * d.balance - (d.apr / 24) * p;
    }, 0);

    glp.glp_delete_prob(m);
    return { ok: true, w, interest, savings, payments, objective: obj };
  };

  const [frontier, best] = useMemo(() => {
    if (!glpk || debts.length === 0 || monthlyBudget <= 0) return [[], null] as const;

    const pts: SolveResult[] = [];
    for (let i = 0; i < sweepPoints; i++) {
      const w = sweepPoints === 1 ? 0.5 : i / (sweepPoints - 1);
      const res = solveLP(w);
      if (res && res.ok) pts.push(res);
    }
    // Choose the knee by maximizing savings - normalized interest
    if (pts.length === 0) return [[], null] as const;
    const maxS = Math.max(...pts.map(p => p.savings));
    const minS = Math.min(...pts.map(p => p.savings));
    const maxI = Math.max(...pts.map(p => p.interest));
    const minI = Math.min(...pts.map(p => p.interest));

    const score = (p: SolveResult) => {
      const sN = maxS === minS ? 0 : (p.savings - minS) / (maxS - minS);
      const iN = maxI === minI ? 0 : (p.interest - minI) / (maxI - minI);
      return sN - iN; // maximize savings, minimize interest
    };
    const best = pts.reduce((a, b) => (score(b) > score(a) ? b : a));

    return [pts, best] as const;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glpk, debts, monthlyBudget, enforceEmergencyFund, emergencyFundMin, sweepPoints]);

  const data = useMemo(() => {
    return {
      datasets: [
        {
          label: "Pareto Frontier (Savings vs. Interest)",
          data: frontier.map(p => ({ x: p.interest, y: p.savings })),
          showLine: true,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.2)",
        },
        {
          label: "Selected (knee)",
          data: best ? [{ x: best.interest, y: best.savings }] : [],
          pointRadius: 6,
          borderColor: "#10b981",
          backgroundColor: "#10b981",
        }
      ]
    };
  }, [frontier, best]);

  const chartOptions = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Monthly Interest ($)" } },
      y: { title: { display: true, text: "Monthly Savings ($)" } }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Interest: $${ctx.parsed.x.toFixed(2)}, Savings: $${ctx.parsed.y.toFixed(2)}`
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${gameMode === 'game' ? 'text-indigo-900' : 'text-gray-800'}`}>
          🤖 Optimization Engine (LP) — Monthly Allocation
        </h3>
        <p className="text-gray-600 mb-4">
          Finds an optimal split between paying debts and saving, trading off interest vs savings using GLPK in WebAssembly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-gray-700">Monthly Budget</div>
            <div className="text-2xl font-bold text-green-600">${monthlyBudget.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-gray-700">Debts</div>
            <div className="text-2xl font-bold text-purple-600">{debts.length}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-gray-700">Solver</div>
            <div className="text-2xl font-bold">{loadingSolver ? "Loading…" : (glpk ? "Ready" : "—")}</div>
          </div>
        </div>
      </div>

      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' : 'bg-white'}`}>
        <h4 className={`font-semibold mb-4 ${gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>Debts</h4>
        <div className="space-y-4">
          {debts.map((d, idx) => (
            <div key={d.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-white border p-3 rounded">
              <input
                className={inputClass}
                value={d.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setDebts(prev => prev.map(x => x.id === d.id ? { ...x, name: v } : x));
                }}
                placeholder="Name"
              />
              <input
                type="number"
                className={inputClass}
                value={d.balance}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setDebts(prev => prev.map(x => x.id === d.id ? { ...x, balance: v } : x));
                }}
                placeholder="Balance $"
              />
              <input
                type="number"
                step="0.001"
                className={inputClass}
                value={d.apr}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setDebts(prev => prev.map(x => x.id === d.id ? { ...x, apr: v } : x));
                }}
                placeholder="APR (0.22)"
              />
              <input
                type="number"
                className={inputClass}
                value={d.minPayment}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setDebts(prev => prev.map(x => x.id === d.id ? { ...x, minPayment: v } : x));
                }}
                placeholder="Min Payment $"
              />
              <input
                type="number"
                className={inputClass}
                value={d.maxPayment ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? undefined : (parseFloat(e.target.value) || 0);
                  setDebts(prev => prev.map(x => x.id === d.id ? { ...x, maxPayment: v } : x));
                }}
                placeholder="Max Payment (opt)"
              />
              <button
                onClick={() => removeDebt(d.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button onClick={addDebt} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Add Debt
          </button>
        </div>
      </div>

      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200' : 'bg-white'}`}>
        <h4 className={`font-semibold mb-4 ${gameMode === 'game' ? 'text-green-900' : 'text-gray-800'}`}>Constraints & Sweep</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-3 bg-white border p-3 rounded">
            <input
              type="checkbox"
              checked={enforceEmergencyFund}
              onChange={(e) => setEnforceEmergencyFund(e.target.checked)}
            />
            <span className="text-gray-700">Enforce minimum savings</span>
          </label>
          <input
            type="number"
            className={inputClass}
            value={emergencyFundMin}
            onChange={(e) => setEmergencyFundMin(parseFloat(e.target.value) || 0)}
            placeholder="Min savings $"
          />
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={3}
              max={21}
              value={sweepPoints}
              onChange={(e) => setSweepPoints(parseInt(e.target.value) || 11)}
              className="w-full"
            />
            <span className="text-gray-700">Points: {sweepPoints}</span>
          </div>
        </div>
      </div>

      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200' : 'bg-white'}`}>
        <h4 className={`font-semibold mb-4 ${gameMode === 'game' ? 'text-blue-900' : 'text-gray-800'}`}>Pareto Frontier</h4>
        <div className="bg-white border rounded p-3">
          <Scatter data={data} options={chartOptions as any} />
        </div>
        {best && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white border rounded">
              <div className="text-gray-600 text-sm">Selected weight</div>
              <div className="text-2xl font-bold">{best.w.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-white border rounded">
              <div className="text-gray-600 text-sm">Monthly Interest (approx)</div>
              <div className="text-2xl font-bold text-red-600">${best.interest.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-white border rounded">
              <div className="text-gray-600 text-sm">Savings</div>
              <div className="text-2xl font-bold text-green-600">${best.savings.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {best && (
        <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200' : 'bg-white'}`}>
          <h4 className={`font-semibold mb-4 ${gameMode === 'game' ? 'text-yellow-900' : 'text-gray-800'}`}>Optimal Allocation (Selected)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {debts.map((d) => (
              <div key={d.id} className="p-3 bg-white border rounded">
                <div className="font-semibold text-gray-800">{d.name}</div>
                <div className="text-sm text-gray-600">Balance: ${d.balance.toLocaleString()}</div>
                <div className="text-sm text-gray-600">APR: {(d.apr * 100).toFixed(1)}%</div>
                <div className="mt-1 text-lg font-bold text-purple-700">
                  Pay: ${best.payments[d.id].toFixed(2)}
                </div>
              </div>
            ))}
            <div className="p-3 bg-white border rounded">
              <div className="font-semibold text-gray-800">Savings</div>
              <div className="mt-1 text-lg font-bold text-green-700">
                ${best.savings.toFixed(2)}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Objective trades off minimizing interest and maximizing savings; move the sweep to explore different trade-offs.
          </p>
        </div>
      )}
    </div>
  );
};