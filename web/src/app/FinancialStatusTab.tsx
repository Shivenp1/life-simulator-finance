interface FinancialStatusTabProps {
  currentSalary: number;
  hasHouse: boolean;
  housePrice: number;
  downPayment: number;
  totalMonthlyHousingCost: number;
  currentYear: number;
  monthlySP500Investment: number;
  totalSP500Value: number;
  hasCar: boolean;
  carPrice: number;
  totalMonthlyCarCost: number;
  hasRental: boolean;
  selectedRental: any;
  monthlyRent: number;
  afterTaxIncome: number;
  accumulatedMoney: number;
  gameMode: 'game' | 'serious';
}

export const FinancialStatusTab = ({
  currentSalary,
  hasHouse,
  housePrice,
  downPayment,
  totalMonthlyHousingCost,
  currentYear,
  monthlySP500Investment,
  totalSP500Value,
  hasCar,
  carPrice,
  totalMonthlyCarCost,
  hasRental,
  selectedRental,
  monthlyRent,
  afterTaxIncome,
  accumulatedMoney,
  gameMode
}: FinancialStatusTabProps) => {
  const monthlyTakeHome = afterTaxIncome / 12;
  
  // Budget categories with typical amounts
  const budgetCategories = [
    { name: "Housing", amount: hasHouse ? totalMonthlyHousingCost : 0, color: "bg-red-100 text-red-800" },
    { name: "Rental", amount: hasRental ? monthlyRent : 0, color: "bg-purple-100 text-purple-800" },
    { name: "Car", amount: hasCar ? totalMonthlyCarCost : 0, color: "bg-blue-100 text-blue-800" },
    { name: "S&P 500 Investment", amount: monthlySP500Investment, color: "bg-indigo-100 text-indigo-800" },
    { name: "Utilities", amount: 200, color: "bg-orange-100 text-orange-800" },
    { name: "Groceries", amount: 300, color: "bg-yellow-100 text-yellow-800" },
    { name: "Entertainment", amount: 200, color: "bg-purple-100 text-purple-800" },
    { name: "Other", amount: 300, color: "bg-gray-100 text-gray-800" }
  ];

  const totalMonthlyExpenses = budgetCategories.reduce((sum, category) => sum + category.amount, 0);
  const monthlyNetIncome = monthlyTakeHome - totalMonthlyExpenses;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Financial Overview */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-green-900' : 'text-gray-800'}`}>
          �� Financial Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Annual Salary</h4>
            <p className="text-xl font-bold text-green-600">${currentSalary.toLocaleString()}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">After Tax Income</h4>
            <p className="text-xl font-bold text-blue-600">${afterTaxIncome.toLocaleString()}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Monthly Take Home</h4>
            <p className="text-xl font-bold text-indigo-600">${monthlyTakeHome.toLocaleString()}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${gameMode === 'game' ? 'bg-white border-2 border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Money in Bank</h4>
            <p className="text-xl font-bold text-purple-600">${accumulatedMoney.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Breakdown */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-blue-900' : 'text-gray-800'}`}>
          📊 Monthly Budget Breakdown
        </h3>
        
        <div className="space-y-4">
          {budgetCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                  {category.name}
                </span>
                {category.amount > 0 && (
                  <span className="text-gray-600">
                    {category.name === "Housing" && hasHouse && `🏠 House (${housePrice.toLocaleString()})`}
                    {category.name === "Rental" && hasRental && `�� ${selectedRental?.name}`}
                    {category.name === "Car" && hasCar && `�� Car (${carPrice.toLocaleString()})`}
                    {category.name === "S&P 500 Investment" && monthlySP500Investment > 0 && "📈 Investment"}
                    {category.name === "Utilities" && "⚡ Utilities"}
                    {category.name === "Groceries" && "🛒 Groceries"}
                    {category.name === "Entertainment" && "🎬 Entertainment"}
                    {category.name === "Other" && "📦 Other Expenses"}
                  </span>
                )}
              </div>
              <span className="font-semibold text-gray-900">
                ${category.amount.toLocaleString()}
              </span>
            </div>
          ))}
          
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-800">Total Monthly Expenses</span>
              <span className="font-bold text-gray-900">${totalMonthlyExpenses.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-300 mt-2">
              <span className="font-semibold text-gray-800">Monthly Net Income</span>
              <span className={`font-bold text-lg ${monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${monthlyNetIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets & Liabilities */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>
          🏦 Assets & Liabilities
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="space-y-4">
            <h4 className="font-semibold text-green-800 text-lg">Assets</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700">Money in Bank</span>
                <span className="font-semibold text-green-600">${accumulatedMoney.toLocaleString()}</span>
              </div>
              
              {hasHouse && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-700">House Value</span>
                  <span className="font-semibold text-green-600">${housePrice.toLocaleString()}</span>
                </div>
              )}
              
              {hasCar && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-700">Car Value</span>
                  <span className="font-semibold text-green-600">${carPrice.toLocaleString()}</span>
                </div>
              )}
              
              {monthlySP500Investment > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-700">S&P 500 Portfolio</span>
                  <span className="font-semibold text-green-600">${totalSP500Value.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Liabilities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-red-800 text-lg">Monthly Expenses</h4>
            <div className="space-y-3">
              {hasHouse && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700">House Payment</span>
                  <span className="font-semibold text-red-600">${totalMonthlyHousingCost.toLocaleString()}</span>
                </div>
              )}
              
              {hasRental && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700">Rent Payment</span>
                  <span className="font-semibold text-red-600">${monthlyRent.toLocaleString()}</span>
                </div>
              )}
              
              {hasCar && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700">Car Payment</span>
                  <span className="font-semibold text-red-600">${totalMonthlyCarCost.toLocaleString()}</span>
                </div>
              )}
              
              {monthlySP500Investment > 0 && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700">Investment Contribution</span>
                  <span className="font-semibold text-red-600">${monthlySP500Investment.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-yellow-900' : 'text-gray-800'}`}>
          🎯 Financial Health Score
        </h3>
        
        <div className="space-y-4">
          {(() => {
            let score = 0;
            let factors = [];
            
            // Investment factor
            if (monthlySP500Investment > 0) {
              score += 25;
              factors.push("✅ Investing for the future");
            } else {
              factors.push("❌ Not investing");
            }
            
            // Housing factor
            if (hasHouse || hasRental) {
              score += 25;
              factors.push(hasHouse ? "✅ Homeowner" : "✅ Renting");
            } else {
              factors.push("❌ No housing");
            }
            
            // Transportation factor
            if (hasCar) {
              score += 20;
              factors.push("✅ Has transportation");
            } else {
              factors.push("❌ No transportation");
            }
            
            // Savings factor
            if (accumulatedMoney > 0) {
              score += 20;
              factors.push("✅ Has savings");
            } else {
              factors.push("❌ No savings");
            }
            
            // Income vs expenses factor
            if (monthlyNetIncome > 0) {
              score += 10;
              factors.push("✅ Living within means");
            } else {
              factors.push("❌ Spending more than earning");
            }
            
            const getScoreColor = (score: number) => {
              if (score >= 80) return "text-green-600";
              if (score >= 60) return "text-yellow-600";
              if (score >= 40) return "text-orange-600";
              return "text-red-600";
            };
            
            const getScoreBg = (score: number) => {
              if (score >= 80) return "bg-green-100";
              if (score >= 60) return "bg-yellow-100";
              if (score >= 40) return "bg-orange-100";
              return "bg-red-100";
            };
            
            return (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(score)} border-4 border-gray-300`}>
                    <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-800">Financial Health Score</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {factors.map((factor, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Game Mode Specific Features */}
      {gameMode === 'game' && (
        <div className="rounded-lg shadow-md p-6 bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-200">
          <h3 className="text-lg font-semibold mb-4 text-pink-900">
            �� Game Mode Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="font-semibold text-pink-800">Higher Investment Returns</p>
                <p className="text-sm text-pink-700">Your investments grow 15% annually instead of 10%!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-pink-800">Achievement System</p>
                <p className="text-sm text-pink-700">Unlock achievements for major life milestones!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="font-semibold text-pink-800">Colorful Interface</p>
                <p className="text-sm text-pink-700">Enjoy a more vibrant and engaging experience!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};