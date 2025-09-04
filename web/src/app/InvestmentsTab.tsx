import { useState } from "react";

interface InvestmentsTabProps {
  bankBalance: number;
  setBankBalance: (amount: number) => void;
  currentYear: number;
  currentAge: number;
  monthlySP500Investment: number;
  setMonthlySP500Investment: (amount: number) => void;
  totalSP500Value: number;
  setTotalSP500Value: (amount: number) => void;
}

export const InvestmentsTab = ({
  bankBalance,
  setBankBalance,
  currentYear,
  currentAge,
  monthlySP500Investment,
  setMonthlySP500Investment,
  totalSP500Value,
  setTotalSP500Value
}: InvestmentsTabProps) => {
  const [investments, setInvestments] = useState({
    sp500: 0,
    savingsAccount: 0
  });

  // Investment returns (annual)
  const sp500Return = 0.10; // 10% average annual return
  const savingsReturn = 0.02; // 2% annual return

  const totalInvestments = investments.sp500 + investments.savingsAccount + totalSP500Value;
  const totalValue = totalInvestments;

  const investInSP500 = (amount: number) => {
    if (amount <= bankBalance && amount > 0) {
      setInvestments(prev => ({
        ...prev,
        sp500: prev.sp500 + amount
      }));
      setBankBalance(prev => prev - amount);
    }
  };

  const investInSavings = (amount: number) => {
    if (amount <= bankBalance && amount > 0) {
      setInvestments(prev => ({
        ...prev,
        savingsAccount: prev.savingsAccount + amount
      }));
      setBankBalance(prev => prev - amount);
    }
  };

  const withdrawFromSP500 = (amount: number) => {
    if (amount <= investments.sp500 && amount > 0) {
      setInvestments(prev => ({
        ...prev,
        sp500: prev.sp500 - amount
      }));
      setBankBalance(prev => prev + amount);
    }
  };

  const withdrawFromSavings = (amount: number) => {
    if (amount <= investments.savingsAccount && amount > 0) {
      setInvestments(prev => ({
        ...prev,
        savingsAccount: prev.savingsAccount - amount
      }));
      setBankBalance(prev => prev + amount);
    }
  };

  const toggleMonthlySP500 = () => {
    if (monthlySP500Investment > 0) {
      setMonthlySP500Investment(0);
    } else {
      setMonthlySP500Investment(500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Investment Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 Investment Portfolio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-2">S&P 500 (Lump Sum)</h4>
            <div className="text-2xl font-bold text-blue-600">
              ${investments.sp500.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Expected return: 10% annually
            </p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
            <h4 className="font-medium text-indigo-800 mb-2">S&P 500 (Monthly)</h4>
            <div className="text-2xl font-bold text-indigo-600">
              ${totalSP500Value.toLocaleString()}
            </div>
            <p className="text-sm text-indigo-700 mt-1">
              ${monthlySP500Investment}/month • 10% annually
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="font-medium text-green-800 mb-2">Savings Account</h4>
            <div className="text-2xl font-bold text-green-600">
              ${investments.savingsAccount.toLocaleString()}
            </div>
            <p className="text-sm text-green-700 mt-1">
              Expected return: 2% annually
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <h4 className="font-medium text-purple-800 mb-2">Total Portfolio</h4>
            <div className="text-2xl font-bold text-purple-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Available: ${bankBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Investment Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
           Monthly Investment Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
            <div>
              <h4 className="font-medium text-indigo-800">Monthly S&P 500 Investment</h4>
              <p className="text-sm text-indigo-700">
                Automatically invest ${monthlySP500Investment} every month. This will be deducted from your monthly expenses.
              </p>
            </div>
            <button
              onClick={toggleMonthlySP500}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                monthlySP500Investment > 0
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {monthlySP500Investment > 0 ? "Stop Monthly Investment" : "Start $500/month"}
            </button>
          </div>
          
          {monthlySP500Investment > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div className="flex items-center">
                <div className="text-green-500 text-xl mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Monthly investment active! ${monthlySP500Investment} will be automatically invested each month.
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    This amount will be deducted from your monthly expenses in the Financial Status tab.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💰 One-Time Investment Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* S&P 500 Investment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">S&P 500 (Lump Sum)</h4>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => investInSP500(1000)}
                  disabled={bankBalance < 1000}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest $1,000
                </button>
                <button
                  onClick={() => investInSP500(5000)}
                  disabled={bankBalance < 5000}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest $5,000
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => investInSP500(10000)}
                  disabled={bankBalance < 10000}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest $10,000
                </button>
                <button
                  onClick={() => investInSP500(bankBalance)}
                  disabled={bankBalance <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest All
                </button>
              </div>
            </div>
          </div>

          {/* Savings Account Investment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Savings Account</h4>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => investInSavings(1000)}
                  disabled={bankBalance < 1000}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest $1,000
                </button>
                <button
                  onClick={() => investInSavings(5000)}
                  disabled={bankBalance < 5000}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest $5,000
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => investInSavings(10000)}
                  disabled={bankBalance < 10000}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest $10,000
                </button>
                <button
                  onClick={() => investInSavings(bankBalance)}
                  disabled={bankBalance <= 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Invest All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Actions */}
      {(investments.sp500 > 0 || investments.savingsAccount > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💸 Withdraw Funds
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* S&P 500 Withdrawal */}
            {investments.sp500 > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Withdraw from S&P 500</h4>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => withdrawFromSP500(1000)}
                      disabled={investments.sp500 < 1000}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Withdraw $1,000
                    </button>
                    <button
                      onClick={() => withdrawFromSP500(5000)}
                      disabled={investments.sp500 < 5000}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Withdraw $5,000
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => withdrawFromSP500(investments.sp500)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Withdraw All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Savings Account Withdrawal */}
            {investments.savingsAccount > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Withdraw from Savings</h4>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => withdrawFromSavings(1000)}
                      disabled={investments.savingsAccount < 1000}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Withdraw $1,000
                    </button>
                    <button
                      onClick={() => withdrawFromSavings(5000)}
                      disabled={investments.savingsAccount < 5000}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Withdraw $5,000
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => withdrawFromSavings(investments.savingsAccount)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Withdraw All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};