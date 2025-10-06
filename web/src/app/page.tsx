"use client"

import { useState } from "react";
import { SimulatorTab } from "./SimulatorTab";
import { FinancialStatusTab } from "./FinancialStatusTab";
import { PurchasesTab } from "./PurchasesTab";
import { InvestmentsTab } from "./InvestmentsTab";
import { OptimizationTab } from "./OptimizationTab";

export default function Page() {
  // Game mode state
  const [gameMode, setGameMode] = useState<'game' | 'serious'>('game');
  
  const [form, setForm] = useState({
    startingSalary: 0,
    salaryGrowthPercent: 0,
    age: 0,
  });

  const [currentYear, setCurrentYear] = useState(1);
  const [currentAge, setCurrentAge] = useState(0);
  const [currentSalary, setCurrentSalary] = useState(0);
  const [housePrice, setHousePrice] = useState(0);
  const [hasHouse, setHasHouse] = useState(false);
  const [carPrice, setCarPrice] = useState(0);
  const [hasCar, setHasCar] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);
  const [monthlySP500Investment, setMonthlySP500Investment] = useState(0);
  const [totalSP500Value, setTotalSP500Value] = useState(0);
  const [activeTab, setActiveTab] = useState("Simulator");
  const [showResetWarning, setShowResetWarning] = useState(false);
  
  // Rental property state
  const [hasRental, setHasRental] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [monthlyRent, setMonthlyRent] = useState(0);

  // Game mode specific state
  const [achievements, setAchievements] = useState<string[]>([]);

  // Investment strategy state
  const [selectedInvestmentStrategy, setSelectedInvestmentStrategy] = useState('moderate');
  const [investmentHistory, setInvestmentHistory] = useState<Array<{year: number, return: number, strategy: string}>>([]);

  // Investment Strategies
  const investmentStrategies = [
    {
      id: 'conservative',
      name: 'Conservative',
      description: 'Low risk, steady growth',
      baseReturn: 0.06,
      risk: 0.1,
      details: 'Bonds, CDs, stable dividend stocks',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '🛡️',
      recommendedFor: 'Risk-averse investors, near retirement'
    },
    {
      id: 'moderate',
      name: 'Moderate',
      description: 'Balanced risk and return',
      baseReturn: 0.08,
      risk: 0.3,
      details: 'Mix of stocks and bonds, index funds',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '⚖️',
      recommendedFor: 'Most investors, long-term growth'
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'High risk, high potential return',
      baseReturn: 0.12,
      risk: 0.6,
      details: 'Growth stocks, small-cap funds, international',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🚀',
      recommendedFor: 'Young investors, long time horizon'
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneur',
      description: 'Start your own business',
      baseReturn: 0.20,
      risk: 0.8,
      details: 'Business investments, real estate, startups',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '💼',
      recommendedFor: 'Risk-tolerant, business-minded individuals'
    }
  ];

  const calculateActualReturn = (strategyId: string, year: number) => {
    const strategy = investmentStrategies.find(s => s.id === strategyId);
    if (!strategy) return 0.08; // Default to moderate
    
    const random = Math.random();
    const risk = strategy.risk;
    const baseReturn = strategy.baseReturn;
    
    // If random number is less than risk, we have a bad year
    if (random < risk) {
      // Bad year: return between -50% and 0% of base return
      const badReturn = baseReturn * (Math.random() * 0.5 - 0.5);
      return badReturn;
    } else {
      // Good year: return between base return and base return + 50%
      const goodReturn = baseReturn + (Math.random() * baseReturn * 0.5);
      return goodReturn;
    }
  };

  const simulateYear = () => {
    if (currentYear === 1) {
      setCurrentAge(form.age);
      setCurrentSalary(form.startingSalary);
    } else {
      setCurrentAge(prev => prev + 1);
      setCurrentSalary(prev => prev * (1 + form.salaryGrowthPercent / 100));
      
      // Apply growth to monthly S&P 500 investment with risk
      if (monthlySP500Investment > 0) {
        const monthlyContribution = monthlySP500Investment * 12;
        
        // Get the actual return for this year based on selected strategy
        const actualReturn = calculateActualReturn(selectedInvestmentStrategy, currentYear);
        
        // Update portfolio value
        setTotalSP500Value(prev => {
          const newValue = (prev + monthlyContribution) * (1 + actualReturn);
          return newValue;
        });
        
        // Store this year's return in history (moved outside to prevent duplicates)
        setInvestmentHistory(prevHistory => {
          // Check if this year already exists in history
          const yearExists = prevHistory.some(entry => entry.year === currentYear);
          if (yearExists) {
            return prevHistory; // Don't add duplicate
          }
          return [
            ...prevHistory,
            { year: currentYear, return: actualReturn, strategy: selectedInvestmentStrategy }
          ];
        });
      }
    }
    
    setCurrentYear(prev => prev + 1);
    
    // Game mode: Check for achievements
    if (gameMode === 'game') {
      checkAchievements();
    }
  };

  const checkAchievements = () => {
    const newAchievements = [...achievements];
    
    if (hasHouse && !achievements.includes('homeowner')) {
      newAchievements.push('homeowner');
    }
    if (hasCar && !achievements.includes('car_owner')) {
      newAchievements.push('car_owner');
    }
    if (hasRental && !achievements.includes('renter')) {
      newAchievements.push('renter');
    }
    if (currentYear >= 5 && !achievements.includes('survivor')) {
      newAchievements.push('survivor');
    }
    
    setAchievements(newAchievements);
  };

  const handleBuyHouse = () => {
    const downPayment = housePrice * 0.10;
    if (totalSavings >= downPayment) {
      setTotalSavings(prev => prev - downPayment);
      setHasHouse(true);
    }
  };

  const handleBuyCar = () => {
    if (totalSavings >= carPrice) {
      setTotalSavings(prev => prev - carPrice);
      setHasCar(true);
    }
  };

  const handleBuyRental = () => {
    if (selectedRental && totalSavings >= selectedRental.price) {
      setTotalSavings(prev => prev - selectedRental.price);
      setHasRental(true);
      setMonthlyRent(selectedRental.rent);
    }
  };

  const resetSimulation = () => {
    setCurrentYear(1);
    setCurrentAge(0);
    setCurrentSalary(0);
    setTotalSavings(0);
    setTotalSP500Value(0);
    setMonthlySP500Investment(0);
    setHasHouse(false);
    setHasCar(false);
    setHasRental(false);
    setSelectedRental(null);
    setMonthlyRent(0);
    setAchievements([]);
    setInvestmentHistory([]);
    setShowResetWarning(false);
  };

  const monthlyTakeHome = currentSalary / 12 * 0.7; // 70% after taxes
  const monthlyExpenses = (hasHouse ? housePrice * 0.003 : 0) + (hasCar ? carPrice * 0.01 : 0) + 2000; // House maintenance, car maintenance, living expenses
  const availableMonthlyIncome = monthlyTakeHome - monthlyExpenses + (hasRental ? monthlyRent : 0);

  return (
    <div className={`min-h-screen ${gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`text-center mb-8 ${gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>
          <h1 className={`text-4xl font-bold mb-4 ${gameMode === 'game' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}>
            {gameMode === 'game' ? '🎮 Life Simulator Finance' : 'Personal Finance Simulator'}
          </h1>
          <p className={`text-lg ${gameMode === 'game' ? 'text-purple-700' : 'text-gray-600'}`}>
            {gameMode === 'game' ? 'Build your financial empire one decision at a time!' : 'Plan your financial future with realistic simulations'}
          </p>
        </div>

        {/* Game Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className={`p-1 rounded-lg ${gameMode === 'game' ? 'bg-purple-200' : 'bg-gray-200'}`}>
            <button
              onClick={() => setGameMode('game')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                gameMode === 'game' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              🎮 Game Mode
            </button>
            <button
              onClick={() => setGameMode('serious')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                gameMode === 'serious' 
                  ? 'bg-gray-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Serious Mode
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowResetWarning(true)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              gameMode === 'game' 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            �� Reset Simulation
          </button>
        </div>

        {/* Reset Warning Modal */}
        {showResetWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Reset Simulation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to reset? This will clear all your progress and start over.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={resetSimulation}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetWarning(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`mb-8 ${gameMode === 'game' ? 'bg-white rounded-lg shadow-lg p-2' : 'bg-white rounded-lg shadow-sm p-2'}`}>
          <div className="flex flex-wrap justify-center gap-2">
            {["Simulator", "Financial Status", "Purchases", "Investments", "Optimization"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? gameMode === 'game'
                      ? 'bg-purple-600 text-white shadow-md transform scale-105'
                      : 'bg-blue-600 text-white shadow-md'
                    : gameMode === 'game'
                      ? 'text-purple-600 hover:bg-purple-100 hover:scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === "Simulator" && "�� Simulator"}
                {tab === "Financial Status" && "�� Financial Status"}
                {tab === "Purchases" && "🛒 Purchases"}
                {tab === "Investments" && "📈 Investments"}
                {tab === "Optimization" && "🤖 Optimization"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === "Simulator" && (
            <SimulatorTab
              form={form}
              setForm={setForm}
              currentYear={currentYear}
              currentAge={currentAge}
              currentSalary={currentSalary}
              hasHouse={hasHouse}
              hasRental={hasRental}
              gameMode={gameMode}
              achievements={achievements}
              onSimulate={simulateYear}
              onGoToPurchases={() => setActiveTab("Purchases")}
            />
          )}
          
          {activeTab === "Financial Status" && (
            <FinancialStatusTab
              form={form}
              setForm={setForm}
              currentYear={currentYear}
              currentAge={currentAge}
              currentSalary={currentSalary}
              housePrice={housePrice}
              setHousePrice={setHousePrice}
              hasHouse={hasHouse}
              carPrice={carPrice}
              setCarPrice={setCarPrice}
              hasCar={hasCar}
              totalSavings={totalSavings}
              setTotalSavings={setTotalSavings}
              monthlySP500Investment={monthlySP500Investment}
              setMonthlySP500Investment={setMonthlySP500Investment}
              totalSP500Value={totalSP500Value}
              monthlyTakeHome={monthlyTakeHome}
              monthlyExpenses={monthlyExpenses}
              availableMonthlyIncome={availableMonthlyIncome}
              gameMode={gameMode}
              onGoToPurchases={() => setActiveTab("Purchases")}
            />
          )}
          
          {activeTab === "Purchases" && (
            <PurchasesTab
              form={form}
              setForm={setForm}
              currentYear={currentYear}
              currentAge={currentAge}
              currentSalary={currentSalary}
              housePrice={housePrice}
              setHousePrice={setHousePrice}
              hasHouse={hasHouse}
              carPrice={carPrice}
              setCarPrice={setCarPrice}
              hasCar={hasCar}
              totalSavings={totalSavings}
              setTotalSavings={setTotalSavings}
              monthlySP500Investment={monthlySP500Investment}
              setMonthlySP500Investment={setMonthlySP500Investment}
              totalSP500Value={totalSP500Value}
              monthlyTakeHome={monthlyTakeHome}
              monthlyExpenses={monthlyExpenses}
              availableMonthlyIncome={availableMonthlyIncome}
              gameMode={gameMode}
              hasRental={hasRental}
              selectedRental={selectedRental}
              setSelectedRental={setSelectedRental}
              monthlyRent={monthlyRent}
              onBuyHouse={handleBuyHouse}
              onBuyCar={handleBuyCar}
              onBuyRental={handleBuyRental}
              onGoToPurchases={() => setActiveTab("Purchases")}
            />
          )}
          
          {activeTab === "Investments" && (
            <InvestmentsTab
              currentYear={currentYear}
              currentAge={currentAge}
              monthlySP500Investment={monthlySP500Investment}
              setMonthlySP500Investment={setMonthlySP500Investment}
              totalSP500Value={totalSP500Value}
              monthlyTakeHome={monthlyTakeHome}
              monthlyExpenses={monthlyExpenses}
              availableMonthlyIncome={availableMonthlyIncome}
              gameMode={gameMode}
              selectedStrategy={selectedInvestmentStrategy}
              setSelectedStrategy={setSelectedInvestmentStrategy}
              investmentHistory={investmentHistory}
            />
          )}

          {activeTab === "Optimization" && (
            <OptimizationTab
              monthlyBudget={Math.max(0, Math.floor(availableMonthlyIncome))}
              gameMode={gameMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className={`text-center text-sm ${gameMode === 'game' ? 'text-purple-600' : 'text-gray-500'}`}>
          <p>
            {gameMode === 'game' 
              ? '�� Ready to build your financial empire? Make smart choices and watch your wealth grow!' 
              : '📊 Plan wisely, invest consistently, and secure your financial future.'}
          </p>
        </div>
      </div>
    </div>
  );
}