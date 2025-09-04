import { useState } from "react";


interface InvestmentsTabProps {
    bankBalance: number;
    setBankBalance: (amount: number) => void;
    currentYear: number;
    currentAge: number;
  }
  
  export const InvestmentsTab = ({
    bankBalance,
    setBankBalance,
    currentYear,
    currentAge
  }: InvestmentsTabProps) => {
    const [investments, setInvestments] = useState({
      stocks: 0,
      bonds: 0,
      retirement401k: 0,
      retirementIRA: 0,
      emergencyFund: 0
    });
  
    const [investmentHistory, setInvestmentHistory] = useState<Array<{
      year: number;
      stocks: number;
      bonds: number;
      retirement401k: number;
      retirementIRA: number;
      emergencyFund: number;
    }>>([]);
  
    // Investment options with different risk levels and returns
    const investmentOptions = [
      {
        name: "Stocks (S&P 500)",
        type: "stocks",
        annualReturn: 0.10, // 10% average
        risk: "High",
        color: "bg-green-100 text-green-800",
        description: "Broad market index fund"
      },
      {
        name: "Bonds (10-Year Treasury)",
        type: "bonds", 
        annualReturn: 0.04, // 4% average
        risk: "Low",
        color: "bg-blue-100 text-blue-800",
        description: "Government bonds"
      },
      {
        name: "401k (Employer Match)",
        type: "retirement401k",
        annualReturn: 0.08, // 8% average
        risk: "Medium",
        color: "bg-purple-100 text-purple-800",
        description: "Tax-advantaged retirement"
      },
      {
        name: "IRA (Roth)",
        type: "retirementIRA",
        annualReturn: 0.08, // 8% average
        risk: "Medium", 
        color: "bg-indigo-100 text-indigo-800",
        description: "Tax-free growth"
      },
      {
        name: "Emergency Fund",
        type: "emergencyFund",
        annualReturn: 0.02, // 2% savings account
        risk: "None",
        color: "bg-gray-100 text-gray-800",
        description: "High-yield savings"
      }
    ];
  
    // Calculate total investment value with compound growth
    const calculateInvestmentValue = (type: string, amount: number, years: number) => {
      const option = investmentOptions.find(opt => opt.type === type);
      if (!option || amount === 0) return 0;
      
      return amount * Math.pow(1 + option.annualReturn, years);
    };
  
    // Calculate total portfolio value
    const totalPortfolioValue = Object.entries(investments).reduce((total, [type, amount]) => {
      return total + calculateInvestmentValue(type, amount, currentYear - 1);
    }, 0);
  
    const totalInvested = Object.values(investments).reduce((sum, amount) => sum + amount, 0);
    const totalGains = totalPortfolioValue - totalInvested;
  
    const handleInvestment = (type: string, amount: number) => {
      if (bankBalance >= amount) {
        setInvestments(prev => ({
          ...prev,
          [type]: prev[type as keyof typeof prev] + amount
        }));
        setBankBalance(prev => prev - amount);
        
        // Add to history
        setInvestmentHistory(prev => [...prev, {
          year: currentYear,
          stocks: investments.stocks + (type === 'stocks' ? amount : 0),
          bonds: investments.bonds + (type === 'bonds' ? amount : 0),
          retirement401k: investments.retirement401k + (type === 'retirement401k' ? amount : 0),
          retirementIRA: investments.retirementIRA + (type === 'retirementIRA' ? amount : 0),
          emergencyFund: investments.emergencyFund + (type === 'emergencyFund' ? amount : 0)
        }]);
      }
    };
  
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Portfolio Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📈 Investment Portfolio
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-800 mb-2">Total Portfolio Value</h4>
              <div className="text-3xl font-bold text-green-600">
                ${totalPortfolioValue.toLocaleString()}
              </div>
              <p className="text-sm text-green-700 mt-1">
                Current market value
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-800 mb-2">Total Invested</h4>
              <div className="text-2xl font-bold text-blue-600">
                ${totalInvested.toLocaleString()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Principal invested
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-medium text-purple-800 mb-2">Total Gains</h4>
              <div className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalGains.toLocaleString()}
              </div>
              <p className="text-sm text-purple-700 mt-1">
                {totalGains >= 0 ? 'Profit' : 'Loss'}
              </p>
            </div>
          </div>
        </div>
  
        {/* Investment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {investmentOptions.map((option) => {
            const currentAmount = investments[option.type as keyof typeof investments];
            const currentValue = calculateInvestmentValue(option.type, currentAmount, currentYear - 1);
            const gains = currentValue - currentAmount;
            
            return (
              <div key={option.type} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">{option.name}</h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${option.color}`}>
                    {option.risk} Risk
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Return:</span>
                    <span className="font-medium text-green-600">{(option.annualReturn * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Invested:</span>
                    <span className="font-medium">${currentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Value:</span>
                    <span className="font-medium text-blue-600">${currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gains/Losses:</span>
                    <span className={`font-medium ${gains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${gains.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Amount to invest"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id={`${option.type}-amount`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`${option.type}-amount`) as HTMLInputElement;
                        const amount = Number(input.value) || 0;
                        if (amount > 0) {
                          handleInvestment(option.type, amount);
                          input.value = '';
                        }
                      }}
                      disabled={bankBalance <= 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Invest
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Available: ${bankBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* Investment Strategy Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💡 Investment Strategy Tips
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Asset Allocation by Age</h4>
              <div className="text-sm space-y-2">
                <p><strong>20s-30s:</strong> 80% stocks, 20% bonds</p>
                <p><strong>40s-50s:</strong> 60% stocks, 40% bonds</p>
                <p><strong>60s+:</strong> 40% stocks, 60% bonds</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Retirement Planning</h4>
              <div className="text-sm space-y-2">
                <p><strong>401k:</strong> Max employer match first</p>
                <p><strong>IRA:</strong> $6,500 annual limit</p>
                <p><strong>Emergency Fund:</strong> 3-6 months expenses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };