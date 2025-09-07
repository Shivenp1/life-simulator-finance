import { useState } from "react";

interface InvestmentsTabProps {
  currentYear: number;
  currentAge: number;
  monthlySP500Investment: number;
  setMonthlySP500Investment: (amount: number) => void;
  totalSP500Value: number;
  monthlyTakeHome: number;
  monthlyExpenses: number;
  availableMonthlyIncome: number;
  gameMode: 'game' | 'serious';
}

export const InvestmentsTab = ({
  currentYear,
  currentAge,
  monthlySP500Investment,
  setMonthlySP500Investment,
  totalSP500Value,
  monthlyTakeHome,
  monthlyExpenses,
  availableMonthlyIncome,
  gameMode
}: InvestmentsTabProps) => {
  const [customAmount, setCustomAmount] = useState(0);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  const handlePresetAmount = (amount: number) => {
    setMonthlySP500Investment(amount);
    setCustomAmount(amount);
  };

  const handleCustomAmount = () => {
    setMonthlySP500Investment(customAmount);
  };

  const getInvestmentAdvice = () => {
    if (availableMonthlyIncome <= 0) {
      return {
        message: "You're spending more than you earn. Consider reducing expenses first.",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      };
    }
    
    const recommendedAmount = Math.min(availableMonthlyIncome * 0.2, availableMonthlyIncome);
    
    if (monthlySP500Investment === 0) {
      return {
        message: `Consider investing at least $${Math.round(recommendedAmount)} per month for your future.`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    }
    
    if (monthlySP500Investment >= recommendedAmount) {
      return {
        message: "Great job! You're investing a healthy amount for your future.",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    }
    
    return {
      message: "Good start! Consider increasing your investment as your income grows.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    };
  };

  const advice = getInvestmentAdvice();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Investment Overview */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-indigo-900' : 'text-gray-800'}`}>
          📈 Investment Portfolio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Current Investment</h4>
            <p className="text-2xl font-bold text-indigo-600">
              ${monthlySP500Investment.toLocaleString()}/month
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Portfolio Value</h4>
            <p className="text-2xl font-bold text-green-600">
              ${totalSP500Value.toLocaleString()}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Available Income</h4>
            <p className={`text-2xl font-bold ${availableMonthlyIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${availableMonthlyIncome.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Investment Controls */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-green-900' : 'text-gray-800'}`}>
          💰 Set Monthly Investment
        </h3>
        
        <div className="space-y-6">
          {/* Preset Amounts */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Quick Amounts</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetAmount(amount)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    monthlySP500Investment === amount
                      ? gameMode === 'game' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : gameMode === 'game'
                        ? 'bg-white text-green-700 border-2 border-green-300 hover:bg-green-50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Custom Amount</h4>
            <div className="flex space-x-3">
              <input
                type="number"
                value={customAmount || ''}
                onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
              <button
                onClick={handleCustomAmount}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  gameMode === 'game' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Set Amount
              </button>
            </div>
          </div>

          {/* Investment Advice */}
          <div className={`p-4 rounded-lg border-l-4 ${advice.bgColor} ${advice.borderColor}`}>
            <p className={`font-medium ${advice.color}`}>
              💡 {advice.message}
            </p>
          </div>
        </div>
      </div>

      {/* Investment Education */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-blue-900' : 'text-gray-800'}`}>
          📚 Investment Education
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">S&P 500 Index Fund</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Tracks the 500 largest US companies</p>
              <p>• Historical average return: {gameMode === 'game' ? '15%' : '10%'} annually</p>
              <p>• Low fees and broad diversification</p>
              <p>• Suitable for long-term investing</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Investment Tips</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Start early to benefit from compound growth</p>
              <p>• Invest consistently, even small amounts</p>
              <p>• Don't try to time the market</p>
              <p>• Keep investing through market ups and downs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Calculator */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>
          �� Future Projections
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {gameMode === 'game' ? 'See how your investments could grow! 🚀' : 'See how your investments could grow over time.'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[5, 10, 20].map((years) => {
              const annualContribution = monthlySP500Investment * 12;
              const growthRate = gameMode === 'game' ? 0.15 : 0.10;
              const futureValue = annualContribution * ((Math.pow(1 + growthRate, years) - 1) / growthRate);
              
              return (
                <div key={years} className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-purple-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <h4 className="font-semibold text-gray-800 mb-2">{years} Years</h4>
                  <p className="text-lg font-bold text-purple-600">
                    ${Math.round(futureValue).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total invested: ${(annualContribution * years).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Mode Specific Features */}
      {gameMode === 'game' && (
        <div className="rounded-lg shadow-md p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200">
          <h3 className="text-lg font-semibold mb-4 text-yellow-900">
            🎮 Game Mode Bonus!
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="font-semibold text-yellow-800">Higher Returns</p>
                <p className="text-sm text-yellow-700">Your investments grow 15% annually instead of 10%!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💎</span>
              <div>
                <p className="font-semibold text-yellow-800">Compound Magic</p>
                <p className="text-sm text-yellow-700">Watch your money multiply faster in game mode!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};