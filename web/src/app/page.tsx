"use client"

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid hydration issues
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler);

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
    
    // Enhanced house event
    houseBuyMonth: 12,
    homePrice: 350000,
    downPaymentPercent: 20,
    mortgageRate: 6.5,
    propertyTaxRate: 1.2,
    homeInsuranceMonthly: 150,
    hoaMonthly: 0,
    
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
    
    // NEW: Customizable affordability settings
    customFrontEndRatio: 31,      // Custom housing ratio (%)
    customBackEndRatio: 43,       // Custom total debt ratio (%)
    customMortgageYears: 30,      // Custom mortgage term
    customDownPaymentOptions: [5, 10, 15, 20, 25], // Custom down payment options
    customRateOptions: [5.5, 6.0, 6.5, 7.0, 7.5], // Custom rate options
  });
  
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inputs' | 'results' | 'events' | 'recommendations'>('inputs');
  const [houseRecommendations, setHouseRecommendations] = useState<any[]>([]);
  const [affordabilityAnalysis, setAffordabilityAnalysis] = useState<any>(null);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const api = "http://localhost:8080/simulate";

  // Enhanced customizable house affordability calculator
  const calculateHouseAffordability = (salary: number, downPaymentPercent: number, mortgageRate: number, otherDebts: number = 0) => {
    const monthlyGross = salary / 12;
    
    // Use custom ratios from form
    const maxHousingRatio = form.customFrontEndRatio / 100;
    const maxTotalDebtRatio = form.customBackEndRatio / 100;
    
    const maxMonthlyHousing = monthlyGross * maxHousingRatio;
    const maxTotalDebt = monthlyGross * maxTotalDebtRatio;
    const availableForHousing = maxTotalDebt - otherDebts;
    
    // Use the more restrictive limit
    const monthlyHousingBudget = Math.min(maxMonthlyHousing, availableForHousing);
    
    // Calculate max loan amount using custom mortgage term
    const monthlyRate = mortgageRate / 100 / 12;
    const totalPayments = form.customMortgageYears * 12;
    
    let maxLoanAmount;
    if (monthlyRate === 0) {
      maxLoanAmount = monthlyHousingBudget * totalPayments;
    } else {
      maxLoanAmount = monthlyHousingBudget * (Math.pow(1 + monthlyRate, totalPayments) - 1) / 
                     (monthlyRate * Math.pow(1 + monthlyRate, totalPayments));
    }
    
    // Add down payment to get max house price
    const maxHousePrice = Math.round(maxLoanAmount / (1 - downPaymentPercent / 100));
    
    // Calculate monthly payment breakdown
    const monthlyPayment = monthlyHousingBudget;
    const principalInterest = monthlyPayment * 0.8;
    const taxesInsurance = monthlyPayment * 0.2;
    
    return {
      maxHousePrice,
      monthlyHousingBudget,
      maxLoanAmount: Math.round(maxLoanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      principalInterest: Math.round(principalInterest),
      taxesInsurance: Math.round(taxesInsurance),
      downPayment: Math.round(maxHousePrice * downPaymentPercent / 100),
      frontEndRatio: (monthlyHousingBudget / monthlyGross * 100).toFixed(1),
      backEndRatio: ((monthlyHousingBudget + otherDebts) / monthlyGross * 100).toFixed(1),
      mortgageYears: form.customMortgageYears
    };
  };

  // Generate custom recommendations based on user settings
  const calculateCustomHouseRecommendations = (salary: number) => {
    const otherDebts = (form.loanBalance > 0 ? form.loanMinPayment : 0) + 
                       (form.carPrice > 0 ? 200 : 0);
    
    const recommendations = [];
    
    // Generate recommendations for each down payment and rate combination
    form.customDownPaymentOptions.forEach(downPayment => {
      form.customRateOptions.forEach(rate => {
        const analysis = calculateHouseAffordability(salary, downPayment, rate, otherDebts);
        
        recommendations.push({
          label: `${downPayment}% down, ${rate}% rate`,
          price: analysis.maxHousePrice,
          description: `${analysis.mortgageYears}-year mortgage`,
          monthlyPayment: analysis.monthlyPayment,
          downPayment: analysis.downPayment,
          frontEndRatio: analysis.frontEndRatio,
          backEndRatio: analysis.backEndRatio,
          mortgageRate: rate,
          downPaymentPercent: downPayment,
          mortgageYears: analysis.mortgageYears
        });
      });
    });
    
    // Sort by price (lowest to highest)
    return recommendations.sort((a, b) => a.price - b.price);
  };

  // Auto-fill house price when salary changes
  const handleSalaryChange = (newSalary: number) => {
    const recommendations = calculateCustomHouseRecommendations(newSalary);
    setHouseRecommendations(recommendations);
    
    // Auto-fill with middle recommendation
    const middleIndex = Math.floor(recommendations.length / 2);
    const middleRecommendation = recommendations[middleIndex];
    
    setForm(prev => ({
      ...prev,
      salaryAnnual: newSalary,
      homePrice: middleRecommendation.price,
      downPaymentPercent: middleRecommendation.downPaymentPercent,
      mortgageRate: middleRecommendation.mortgageRate
    }));
    
    // Calculate detailed affordability analysis
    const analysis = calculateHouseAffordability(newSalary, form.downPaymentPercent, form.mortgageRate);
    setAffordabilityAnalysis(analysis);
  };

  // Handle recommendation click
  const handleRecommendationClick = (recommendation: any) => {
    setForm(prev => ({
      ...prev,
      homePrice: recommendation.price,
      downPaymentPercent: recommendation.downPaymentPercent,
      mortgageRate: recommendation.mortgageRate
    }));
  };

  // Enhanced input helper with better styling
  const input = (label: string, key: keyof typeof form, placeholder?: string, type: string = "number") => (
    <label key={String(key)} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={form[key] as number}
        onChange={(e) => {
          const value = Number(e.target.value);
          setForm((s) => ({ ...s, [key]: value }));
          
          // Auto-calculate house recommendations when salary changes
          if (key === 'salaryAnnual') {
            handleSalaryChange(value);
          }
        }}
        placeholder={placeholder}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </label>
  );

  // NEW: Slider input helper
  const sliderInput = (label: string, key: keyof typeof form, min: number, max: number, step: number = 1) => (
    <label key={String(key)} className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-blue-600">{form[key]}{key.includes('Ratio') ? '%' : key.includes('Years') ? ' years' : ''}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={form[key] as number}
        onChange={(e) => {
          const value = Number(e.target.value);
          setForm((s) => ({ ...s, [key]: value }));
          
          if (form.salaryAnnual > 0) {
            const analysis = calculateHouseAffordability(form.salaryAnnual, form.downPaymentPercent, form.mortgageRate);
            setAffordabilityAnalysis(analysis);
          }
        }}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{key.includes('Ratio') ? '%' : key.includes('Years') ? ' years' : ''}</span>
        <span>{max}{key.includes('Ratio') ? '%' : key.includes('Years') ? ' years' : ''}</span>
      </div>
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

  const chartData = {
    labels: res?.monthly.map((m) => `Month ${m.month}`) ?? [],
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
        data: res?.monthly.map((m, index) => {
          // Calculate home equity for each month based on life events
          if (!res) return 0;
          
          const houseBuyMonth = res.inputs.houseBuyMonth || 0;
          if (houseBuyMonth === 0 || m.month < houseBuyMonth) return 0;
          
          // Calculate home value with appreciation
          const homePrice = res.inputs.homePrice || 0;
          const downPaymentPercent = res.inputs.downPaymentPercent || 20;
          const downPayment = homePrice * (downPaymentPercent / 100.0);
          const monthsSincePurchase = m.month - houseBuyMonth;
          const monthlyAppreciation = 0.03 / 12; // 3% annual / 12 months
          const homeValue = homePrice * Math.pow(1 + monthlyAppreciation, monthsSincePurchase);
          
          // Calculate remaining mortgage balance
          const mortgageBalance = Math.max(0, (homePrice - downPayment) * 
            Math.pow(1 + (res.inputs.mortgageRate || 6.5) / 100 / 12, monthsSincePurchase));
          
          return homeValue - mortgageBalance;
        }) ?? [],
        borderColor: COLORS.home,
        backgroundColor: COLORS.home + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Car Value",
        data: res?.monthly.map((m) => {
          // FIXED: Use checkpoint data instead of undefined inputs
          if (!res?.checkpoints?.mid?.carValue && !res?.checkpoints?.final?.carValue) return 0;
          
          const month = m.month;
          const midMonth = res.checkpoints.mid.month;
          const finalMonth = res.checkpoints.final.month;
          
          // If we have car data, interpolate between checkpoints
          if (res.checkpoints.mid.carValue > 0 || res.checkpoints.final.carValue > 0) {
            if (month <= midMonth) {
              // Before or at mid point
              return month < 6 ? 0 : res.checkpoints.mid.carValue;
            } else {
              // After mid point, interpolate to final value
              const progress = (month - midMonth) / (finalMonth - midMonth);
              const startValue = res.checkpoints.mid.carValue;
              const endValue = res.checkpoints.final.carValue;
              return startValue + (endValue - startValue) * progress;
            }
          }
          
          return 0;
        }) ?? [],
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          label: (ctx: any) => `${ctx.dataset.label}: $${Number(ctx.parsed.y).toLocaleString()}`,
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
          callback: (value: any) =>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Life Event Financial Simulator</h1>
          <p className="text-xl text-gray-600">
            See how major life purchases cascade and affect your wealth-building journey
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6">
          {[
            { id: 'inputs', label: '⚙️ Inputs', icon: '⚙️' },
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

            {/* Customizable Affordability Settings */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  ⚙️ Custom Affordability Settings
                </h3>
                <button
                  onClick={() => setShowCustomSettings(!showCustomSettings)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showCustomSettings ? 'Hide' : 'Show'} Advanced Settings
                </button>
              </div>
              
              {showCustomSettings && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sliderInput("Front-end Ratio (Housing)", "customFrontEndRatio", 20, 40, 1)}
                    {sliderInput("Back-end Ratio (Total Debt)", "customBackEndRatio", 30, 50, 1)}
                    {sliderInput("Mortgage Term", "customMortgageYears", 15, 30, 5)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Down Payment Options (%)</label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25].map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              const newOptions = form.customDownPaymentOptions.includes(option) 
                                ? form.customDownPaymentOptions.filter(x => x !== option)
                                : [...form.customDownPaymentOptions, option].sort((a, b) => a - b);
                              setForm(prev => ({ ...prev, customDownPaymentOptions: newOptions }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              form.customDownPaymentOptions.includes(option)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {option}%
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Interest Rate Options (%)</label>
                      <div className="flex flex-wrap gap-2">
                        {[5.5, 6.0, 6.5, 7.0, 7.5].map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              const newOptions = form.customRateOptions.includes(option) 
                                ? form.customRateOptions.filter(x => x !== option)
                                : [...form.customRateOptions, option].sort((a, b) => a - b);
                              setForm(prev => ({ ...prev, customRateOptions: newOptions }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              form.customRateOptions.includes(option)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {option}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced House Affordability Analysis */}
            {affordabilityAnalysis && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  🏠 House Affordability Analysis
                </h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${affordabilityAnalysis.maxHousePrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">Max Affordable House</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        ${affordabilityAnalysis.monthlyPayment.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">Monthly Housing Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        ${affordabilityAnalysis.downPayment.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">Required Down Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {affordabilityAnalysis.mortgageYears}
                      </div>
                      <div className="text-sm text-green-700">Mortgage Term</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 text-center">
                    Front-end ratio: {affordabilityAnalysis.frontEndRatio}% | 
                    Back-end ratio: {affordabilityAnalysis.backEndRatio}%
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced House Recommendations */}
            {houseRecommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  🏠 Custom House Recommendations
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    💡 Based on your ${form.salaryAnnual.toLocaleString()} salary and custom settings:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {houseRecommendations.map((rec, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecommendationClick(rec)}
                        className="bg-white rounded-lg p-3 border border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer text-left w-full group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 group-hover:text-blue-700">
                              {rec.label}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              {rec.description}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Monthly: ${rec.monthlyPayment.toLocaleString()} | 
                              Down: ${rec.downPayment.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-lg font-bold text-blue-600 group-hover:text-blue-800">
                            ${rec.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to auto-fill this option
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    💰 Click any recommendation above to auto-fill the house price, down payment, and rate!
                  </p>
                </div>
              </div>
            )}

            {/* Existing Loans */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🏦 Existing Student Loans
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {input("Loan Balance ($)", "loanBalance")}
                {input("Loan Rate (%)", "loanRateAnnual")}
                {input("Min Payment ($)", "loanMinPayment")}
                {input("Extra Payment ($)", "loanExtraPayment")}
              </div>
            </div>

            {/* Enhanced House Purchase Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🏠 House Purchase Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {input("Buy Month", "houseBuyMonth", "0 = never")}
                {input("Home Price ($)", "homePrice")}
                {input("Down Payment (%)", "downPaymentPercent")}
                {input("Mortgage Rate (%)", "mortgageRate")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {input("Property Tax Rate (%)", "propertyTaxRate", "1.2 = typical")}
                {input("Home Insurance ($/month)", "homeInsuranceMonthly", "150 = typical")}
                {input("HOA Fees ($/month)", "hoaMonthly", "0 = none")}
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
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
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
