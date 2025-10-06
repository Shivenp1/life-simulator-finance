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
  selectedStrategy: string;
  setSelectedStrategy: (strategy: string) => void;
  investmentHistory: Array<{year: number, return: number, strategy: string}>;
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
  gameMode,
  selectedStrategy,
  setSelectedStrategy,
  investmentHistory
}: InvestmentsTabProps) => {
  const [customAmount, setCustomAmount] = useState(0);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  // Investment Strategies
  const investmentStrategies = [
    {
      id: 'conservative',
      name: 'Conservative',
      description: 'Low risk, steady growth',
      baseReturn: 0.06, // 6% base annual return
      risk: 0.1, // 10% chance of losing money in any given year
      details: 'Bonds, CDs, stable dividend stocks',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '🛡️',
      recommendedFor: 'Risk-averse investors, near retirement'
    },
    {
      id: 'moderate',
      name: 'Moderate',
      description: 'Balanced risk and return',
      baseReturn: 0.08, // 8% base annual return
      risk: 0.3, // 30% chance of losing money in any given year
      details: 'Mix of stocks and bonds, index funds',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '⚖️',
      recommendedFor: 'Most investors, long-term growth'
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'High risk, high potential return',
      baseReturn: 0.12, // 12% base annual return
      risk: 0.6, // 60% chance of losing money in any given year
      details: 'Growth stocks, small-cap funds, international',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🚀',
      recommendedFor: 'Young investors, long time horizon'
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneur',
      description: 'Start your own business',
      baseReturn: 0.20, // 20% base annual return
      risk: 0.8, // 80% chance of losing money in any given year
      details: 'Business investments, real estate, startups',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '💼',
      recommendedFor: 'Risk-tolerant, business-minded individuals'
    }
  ];

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
  const currentStrategy = investmentStrategies.find(s => s.id === selectedStrategy);

  // Risk explanation
  const getRiskExplanation = (risk: number) => {
    if (risk === 0.1) return "Very stable - rarely loses value";
    if (risk === 0.3) return "Moderate volatility - some ups and downs";
    if (risk === 0.6) return "High volatility - significant swings";
    if (risk === 0.8) return "Very high volatility - major losses possible";
    return "Unknown risk level";
  };

  // Calculate cumulative portfolio values for each year
  const calculateCumulativeValues = () => {
    if (investmentHistory.length === 0) return [];
    
    let cumulativeValue = 0;
    const annualContribution = monthlySP500Investment * 12;
    
    return investmentHistory.map((yearData, index) => {
      // Add annual contribution
      cumulativeValue += annualContribution;
      // Apply the return for this year
      cumulativeValue = cumulativeValue * (1 + yearData.return);
      
      return {
        year: yearData.year,
        return: yearData.return,
        strategy: yearData.strategy,
        portfolioValue: cumulativeValue,
        totalContributed: annualContribution * (index + 1),
        growth: cumulativeValue - (annualContribution * (index + 1))
      };
    });
  };

  const cumulativeData = calculateCumulativeValues();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Investment Overview */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-indigo-900' : 'text-gray-800'}`}>
          📈 Investment Portfolio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Strategy</h4>
            <p className="text-lg font-bold text-purple-600">
              {currentStrategy?.icon} {currentStrategy?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Investment Strategies */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>
          🎯 Choose Your Investment Strategy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investmentStrategies.map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedStrategy === strategy.id
                  ? `${strategy.color} border-2`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{strategy.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{strategy.name}</h4>
                  <p className="text-sm text-gray-600">{strategy.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Return:</span>
                  <span className="font-semibold text-green-600">
                    {(strategy.baseReturn * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className="font-semibold text-orange-600">
                    {strategy.risk === 0.1 ? 'Low' : 
                     strategy.risk === 0.3 ? 'Medium' : 
                     strategy.risk === 0.6 ? 'High' : 'Very High'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Details:</span>
                  <span className="text-gray-700">{strategy.details}</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <strong>Recommended for:</strong> {strategy.recommendedFor}
              </div>
              
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <strong>Risk explanation:</strong> {getRiskExplanation(strategy.risk)}
              </div>
            </div>
          ))}
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

      {/* Investment Simulation History */}
      {investmentHistory.length > 0 && (
        <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-blue-900' : 'text-gray-800'}`}>
            📊 Investment Simulation History - {currentStrategy?.name} Strategy
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Here's how your portfolio has grown year by year. Each year shows the return rate and cumulative portfolio value.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cumulativeData.map((yearData, index) => (
                <div key={index} className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Year {yearData.year}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      yearData.return >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(yearData.return * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Portfolio Value:</span>
                      <span className="font-semibold text-green-600">
                        ${Math.round(yearData.portfolioValue).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Invested:</span>
                      <span className="text-sm text-gray-700">
                        ${Math.round(yearData.totalContributed).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth:</span>
                      <span className={`text-sm font-medium ${
                        yearData.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${Math.round(yearData.growth).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center">
                    <span className="text-lg mr-2">
                      {yearData.return >= 0 ? '📈' : '📉'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {yearData.return >= 0 ? 'Good year!' : 'Tough year'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className={`mt-6 p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
              <h4 className="font-semibold text-gray-800 mb-3">📈 Portfolio Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Years Simulated</p>
                  <p className="text-xl font-bold text-blue-600">{investmentHistory.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Annual Return</p>
                  <p className={`text-xl font-bold ${
                    (investmentHistory.reduce((sum, year) => sum + year.return, 0) / investmentHistory.length) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {((investmentHistory.reduce((sum, year) => sum + year.return, 0) / investmentHistory.length) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Best Year</p>
                  <p className="text-xl font-bold text-green-600">
                    {Math.max(...investmentHistory.map(year => year.return * 100)).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy-Specific Projections */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-blue-900' : 'text-gray-800'}`}>
          Future Projections - {currentStrategy?.name} Strategy
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {gameMode === 'game' ? 'See how your investments could grow with this strategy! ��' : 'See how your investments could grow with this strategy.'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[5, 10, 20].map((years) => {
              const annualContribution = monthlySP500Investment * 12;
              const growthRate = currentStrategy?.baseReturn || 0.08;
              const futureValue = annualContribution * ((Math.pow(1 + growthRate, years) - 1) / growthRate);
              
              return (
                <div key={years} className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <h4 className="font-semibold text-gray-800 mb-2">{years} Years</h4>
                  <p className="text-lg font-bold text-blue-600">
                    ${Math.round(futureValue).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total invested: ${(annualContribution * years).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Growth: ${Math.round(futureValue - (annualContribution * years)).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Explanation */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-yellow-900' : 'text-gray-800'}`}>
          ⚠️ Understanding Risk
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Risk represents the chance that your investment could lose value in any given year. Higher risk strategies have more potential for both gains and losses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Low Risk (10%)</h4>
              <p className="text-sm text-green-700">
                Very stable investments that rarely lose value. Good for conservative investors or those near retirement.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">High Risk (60-80%)</h4>
              <p className="text-sm text-orange-700">
                Volatile investments with significant potential for both gains and losses. Better for young investors with long time horizons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};