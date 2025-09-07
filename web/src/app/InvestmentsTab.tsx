import { useState } from "react";

interface InvestmentsTabProps {
  currentYear: number;
  currentAge: number;
  monthlySP500Investment: number;
  setMonthlySP500Investment: (amount: number) => void;
  totalSP500Value: number;
  monthlyTakeHome: number;
  monthlyExpenses: number;
  availableMonthlyIncome: number; // Pass from parent instead of calculating here
}

export const InvestmentsTab = ({
  currentYear,
  currentAge,
  monthlySP500Investment,
  setMonthlySP500Investment,
  totalSP500Value,
  monthlyTakeHome,
  monthlyExpenses,
  availableMonthlyIncome
}: InvestmentsTabProps) => {
  const [customAmount, setCustomAmount] = useState(500);

  const setMonthlyInvestment = (amount: number) => {
    if (amount >= 0 && amount <= availableMonthlyIncome) {
      setMonthlySP500Investment(amount);
    }
  };

  const toggleMonthlySP500 = () => {
    if (monthlySP500Investment > 0) {
      setMonthlySP500Investment(0);
    } else {
      setMonthlySP500Investment(Math.min(customAmount, availableMonthlyIncome));
    }
  };

  // Preset amounts for cleaner code
  const presetAmounts = [100, 500, 1000];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Investment Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 S&P 500 Monthly Investment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
            <h4 className="font-medium text-indigo-800 mb-2">Monthly Investment</h4>
            <div className="text-2xl font-bold text-indigo-600">
              ${monthlySP500Investment.toLocaleString()}
            </div>
            <p className="text-sm text-indigo-700 mt-1">
              Per month • 10% annually
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-2">Total Portfolio Value</h4>
            <div className="text-2xl font-bold text-blue-600">
              ${totalSP500Value.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Current value with growth
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="font-medium text-green-800 mb-2">Available Monthly Income</h4>
            <div className="text-2xl font-bold text-green-600">
              ${availableMonthlyIncome.toLocaleString()}
            </div>
            <p className="text-sm text-green-700 mt-1">
              After all expenses
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Investment Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💰 Set Monthly Investment Amount
        </h3>
        
        <div className="space-y-6">
          {/* Custom Amount Input */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Monthly Investment Amount</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount per month
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter amount"
                    min="0"
                    max={availableMonthlyIncome}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ${availableMonthlyIncome.toLocaleString()} (your available monthly income)
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCustomAmount(amount)}
                    disabled={amount > availableMonthlyIncome}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    ${amount.toLocaleString()}
                  </button>
                ))}
                <button
                  onClick={() => setCustomAmount(availableMonthlyIncome)}
                  disabled={availableMonthlyIncome <= 0}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                >
                  All Available
                </button>
              </div>
            </div>
          </div>

          {/* Investment Control */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
            <div>
              <h4 className="font-medium text-indigo-800">Monthly S&P 500 Investment</h4>
              <p className="text-sm text-indigo-700">
                {monthlySP500Investment > 0 
                  ? `Currently investing $${monthlySP500Investment.toLocaleString()} every month. This will be deducted from your monthly expenses.`
                  : `Set an amount above to start monthly investing.`
                }
              </p>
            </div>
            <button
              onClick={toggleMonthlySP500}
              disabled={customAmount <= 0 || customAmount > availableMonthlyIncome || (monthlySP500Investment === 0 && availableMonthlyIncome <= 0)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                monthlySP500Investment > 0
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {monthlySP500Investment > 0 ? "Stop Monthly Investment" : `Start $${customAmount.toLocaleString()}/month`}
            </button>
          </div>
          
          {monthlySP500Investment > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div className="flex items-center">
                <div className="text-green-500 text-xl mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Monthly investment active! ${monthlySP500Investment.toLocaleString()} will be automatically invested each month.
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    This amount will be deducted from your monthly expenses in the Financial Status tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {availableMonthlyIncome <= 0 && (
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <div className="flex items-center">
                <div className="text-red-500 text-xl mr-3">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    You don't have enough monthly income left for any investment.
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Your monthly expenses exceed your take-home pay. Consider reducing expenses first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {customAmount > availableMonthlyIncome && availableMonthlyIncome > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-center">
                <div className="text-yellow-500 text-xl mr-3">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    You can't afford this investment amount with your current monthly income.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Maximum affordable: ${availableMonthlyIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Investment Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">How It Works</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Set any monthly amount you can afford
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Amount is deducted from monthly expenses
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Investment grows by 10% annually
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                You can start/stop anytime
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Monthly Budget</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Take Home:</span>
                <span className="font-medium">${monthlyTakeHome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Expenses:</span>
                <span className="font-medium">${monthlyExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available for Investment:</span>
                <span className="font-medium text-green-600">${availableMonthlyIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};