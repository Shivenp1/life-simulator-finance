interface FinancialStatusTabProps {
  currentSalary: number;
  hasHouse: boolean;
  housePrice: number;
  downPayment: number;
  monthlyMortgage: number;
  totalMonthlyHousingCost: number;
  currentYear: number;
  totalSavings: number;
  setTotalSavings: (amount: number) => void;
  monthlySP500Investment: number;
  totalSP500Value: number;
}

export const FinancialStatusTab = ({
  currentSalary,
  hasHouse,
  housePrice,
  downPayment,
  monthlyMortgage,
  totalMonthlyHousingCost,
  currentYear,
  totalSavings,
  setTotalSavings,
  monthlySP500Investment,
  totalSP500Value
}: FinancialStatusTabProps) => {
  // NJ Tax calculation (simplified)
  const calculateAfterTaxIncome = (salary: number) => {
    // Federal tax brackets (simplified)
    let federalTax = 0;
    if (salary <= 11600) federalTax = salary * 0.10;
    else if (salary <= 47150) federalTax = 1160 + (salary - 11600) * 0.12;
    else if (salary <= 100525) federalTax = 5428 + (salary - 47150) * 0.22;
    else if (salary <= 191950) federalTax = 17470 + (salary - 100525) * 0.24;
    else federalTax = 41847 + (salary - 191950) * 0.32;
    
    // NJ state tax (simplified)
    let njTax = 0;
    if (salary <= 20000) njTax = salary * 0.014;
    else if (salary <= 35000) njTax = 280 + (salary - 20000) * 0.0175;
    else if (salary <= 40000) njTax = 542.50 + (salary - 35000) * 0.035;
    else if (salary <= 75000) njTax = 717.50 + (salary - 40000) * 0.05525;
    else if (salary <= 500000) njTax = 2665.63 + (salary - 75000) * 0.0637;
    else njTax = 30365.63 + (salary - 500000) * 0.0899;
    
    return salary - federalTax - njTax;
  };

  const afterTaxIncome = calculateAfterTaxIncome(currentSalary);
  const monthlyTakeHome = afterTaxIncome / 12;

  // Budget categories with typical amounts
  const budgetCategories = [
    { name: "Housing", amount: hasHouse ? totalMonthlyHousingCost : 0, color: "bg-red-100 text-red-800" },
    { name: "S&P 500 Investment", amount: monthlySP500Investment, color: "bg-indigo-100 text-indigo-800" },
    { name: "Utilities", amount: 200, color: "bg-orange-100 text-orange-800" },
    { name: "Groceries", amount: 300, color: "bg-yellow-100 text-yellow-800" },
    { name: "Entertainment", amount: 200, color: "bg-purple-100 text-purple-800" },
    { name: "Savings", amount: 500, color: "bg-indigo-100 text-indigo-800" },
    { name: "Other", amount: 300, color: "bg-gray-100 text-gray-800" }
  ];

  const totalExpenses = budgetCategories.reduce((sum, category) => sum + category.amount, 0);
  const remainingIncome = monthlyTakeHome - totalExpenses;
  const monthlySavings = Math.max(remainingIncome, 0); // Only positive savings
  const yearlySavings = monthlySavings * 12;

  // Calculate accumulated money based on years simulated
  const calculateAccumulatedMoney = () => {
    if (currentYear <= 1) return 0; // No money accumulated in year 1
    
    let accumulated = 0;
    let currentSalaryForYear = currentSalary;
    
    // Calculate money accumulated for each completed year
    for (let year = 1; year < currentYear; year++) {
      const yearlyAfterTax = calculateAfterTaxIncome(currentSalaryForYear);
      const monthlyTakeHomeForYear = yearlyAfterTax / 12;
      const monthlyNetForYear = monthlyTakeHomeForYear - totalExpenses;
      const yearlyNetForYear = Math.max(monthlyNetForYear * 12, 0);
      
      accumulated += yearlyNetForYear;
      
      // Apply salary growth for next year
      currentSalaryForYear = currentSalaryForYear * 1.05; // 5% growth
    }
    
    return accumulated;
  };

  const accumulatedMoney = calculateAccumulatedMoney();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Financial Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💰 Financial Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Income</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Gross Salary:</span> <span className="font-medium text-green-600">${currentSalary.toLocaleString()}</span></p>
              <p><span className="text-gray-600">After Tax:</span> <span className="font-medium text-green-600">${afterTaxIncome.toLocaleString()}</span></p>
              <p><span className="text-gray-600">Monthly Take Home:</span> <span className="font-medium text-green-600">${monthlyTakeHome.toLocaleString()}</span></p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Assets & Liabilities</h4>
            <div className="space-y-2 text-sm">
              {hasHouse ? (
                <>
                  <p><span className="text-gray-600">House Value:</span> <span className="font-medium text-blue-600">${housePrice.toLocaleString()}</span></p>
                  <p><span className="text-gray-600">Down Payment:</span> <span className="font-medium text-green-600">${downPayment.toLocaleString()}</span></p>
                  <p><span className="text-gray-600">Total Monthly Housing:</span> <span className="font-medium text-red-600">${(totalMonthlyHousingCost || 0).toLocaleString()}</span></p>
                </>
              ) : (
                <p className="text-gray-500">No house purchased yet</p> 
              )}
              {monthlySP500Investment > 0 && (
                <p><span className="text-gray-600">S&P 500 Portfolio:</span> <span className="font-medium text-indigo-600">${totalSP500Value.toLocaleString()}</span></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Money in Bank Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🏦 Money in Bank
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-800 mb-2">Current Bank Balance</h4>
              <div className="text-3xl font-bold text-blue-600">
                ${accumulatedMoney.toLocaleString()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Money accumulated over {currentYear - 1} year{currentYear - 1 !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Monthly Income:</span>
                <span className="font-medium text-green-600">${monthlyTakeHome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Monthly Expenses:</span>
                <span className="font-medium text-red-600">${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Monthly Net:</span>
                <span className={`font-medium ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Year Progress</h4>
              <p className="text-sm text-green-700 mb-3">
                You've completed {currentYear - 1} year{currentYear - 1 !== 1 ? 's' : ''} of simulation
              </p>
              <div className="text-lg font-bold text-green-600">
                ${accumulatedMoney.toLocaleString()} accumulated
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Current Year:</strong> {currentYear}</p>
              <p>Bank balance automatically updates based on years simulated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budgeter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Monthly Budgeter
        </h3>
        
        {/* Budget Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-gray-700">Monthly Take Home:</span>
            <span className="text-xl font-bold text-green-600">${monthlyTakeHome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-gray-700">Total Expenses:</span>
            <span className="text-xl font-bold text-red-600">${totalExpenses.toLocaleString()}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Remaining Income:</span>
            <span className={`text-2xl font-bold ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remainingIncome.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 mb-3">Expense Breakdown</h4>
          {budgetCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                  {category.name}
                </div>
                <span className="text-sm text-gray-600">
                  {category.amount > 0 ? `$${category.amount.toLocaleString()}` : 'Not applicable'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {category.amount > 0 ? `${((category.amount / monthlyTakeHome) * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((category.amount / monthlyTakeHome) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Budget Health Indicator */}
        <div className="mt-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {remainingIncome >= 0 ? (
                <div className="text-green-500 text-xl">✅</div>
              ) : (
                <div className="text-red-500 text-xl">⚠️</div>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${remainingIncome >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {remainingIncome >= 0 
                  ? `Great! You have $${remainingIncome.toLocaleString()} left over each month.`
                  : `Warning! You're spending $${Math.abs(remainingIncome).toLocaleString()} more than you earn monthly.`
                }
              </p>
              {remainingIncome >= 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Consider increasing your savings or investing the extra money.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};