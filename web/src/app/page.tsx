"use client"

import { useState } from "react";
import { SimulatorTab } from "./SimulatorTab";
import { FinancialStatusTab } from "./FinancialStatusTab";
import { PurchasesTab } from "./PurchasesTab";
import { InvestmentsTab } from "./InvestmentsTab";

export default function Page() {
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

  const simulateYear = () => {
    if (currentYear === 1) {
      setCurrentAge(form.age);
      setCurrentSalary(form.startingSalary);
    } else {
      setCurrentAge(prev => prev + 1);
      setCurrentSalary(prev => prev * (1 + form.salaryGrowthPercent / 100));
      
      // Apply 10% growth to monthly S&P 500 investment
      if (monthlySP500Investment > 0) {
        setTotalSP500Value(prev => {
          const monthlyContribution = monthlySP500Investment * 12; // Annual contribution
          const newValue = (prev + monthlyContribution) * 1.10; // Apply 10% growth
          return newValue;
        });
      }
    }
    
    setCurrentYear(prev => prev + 1);
  };

  const handleBuyHouse = () => {
    const downPayment = housePrice * 0.10;
    if (accumulatedMoney >= downPayment) {
      setHasHouse(true);
      // Subtract down payment from bank balance
      setTotalSavings(prev => prev - downPayment);
    }
  };

  const handleBuyCar = () => {
    const carDownPayment = carPrice * 0.20;
    if (accumulatedMoney >= carDownPayment) {
      setHasCar(true);
      // Subtract down payment from bank balance
      setTotalSavings(prev => prev - carDownPayment);
    }
  };

  const handleRentApartment = (rental: any) => {
    const securityDeposit = rental.monthlyRent * 1.5; // 1.5 months security deposit
    if (accumulatedMoney >= securityDeposit) {
      setHasRental(true);
      setSelectedRental(rental);
      setMonthlyRent(rental.monthlyRent);
      // Subtract security deposit from bank balance
      setTotalSavings(prev => prev - securityDeposit);
    }
  };

  const handleEndLease = () => {
    const securityDepositRefund = monthlyRent * 1.5;
    setHasRental(false);
    setSelectedRental(null);
    setMonthlyRent(0);
    // Add security deposit back to bank balance
    setTotalSavings(prev => prev + securityDepositRefund);
  };
  
  const handleUpgradeApartment = (newRental: any) => {
    const currentSecurityDeposit = monthlyRent * 1.5;
    const newSecurityDeposit = newRental.monthlyRent * 1.5;
    const additionalDeposit = newSecurityDeposit - currentSecurityDeposit;
    
    if (accumulatedMoney >= additionalDeposit) {
      setSelectedRental(newRental);
      setMonthlyRent(newRental.monthlyRent);
      // Subtract additional deposit from bank balance
      setTotalSavings(prev => prev - additionalDeposit);
    }
  };

  const goToPurchases = () => {
    setActiveTab("Purchases");
  };

  const handleReset = () => {
    setForm({
      startingSalary: 0,
      salaryGrowthPercent: 0,
      age: 0,
    });
    setCurrentYear(1);
    setCurrentAge(0);
    setCurrentSalary(0);
    setHousePrice(0);
    setHasHouse(false);
    setCarPrice(0);
    setHasCar(false);
    setTotalSavings(0);
    setMonthlySP500Investment(0);
    setTotalSP500Value(0);
    setActiveTab("Simulator");
    setShowResetWarning(false);
    setHasRental(false);
    setSelectedRental(null);
    setMonthlyRent(0);
  };

  // Calculate total monthly housing cost only if housePrice > 0
  const loanAmount = housePrice - (housePrice * 0.10);
  const monthlyMortgagePayment = loanAmount * 0.065 / 12;
  const annualPropertyTaxes = housePrice * 0.015;
  const monthlyPropertyTaxes = annualPropertyTaxes / 12;
  const annualHomeInsurance = housePrice * 0.0035;
  const monthlyHomeInsurance = annualHomeInsurance / 12;
  const pmiRate = 10 < 20 ? 0.007 : 0; // Using 10% down payment
  const annualPMI = loanAmount * pmiRate;
  const monthlyPMI = annualPMI / 12;
  const totalMonthlyHousingCost = housePrice > 0 ? monthlyMortgagePayment + monthlyPropertyTaxes + monthlyHomeInsurance + monthlyPMI : 0;

  // Calculate total monthly car cost
  const carDownPayment = carPrice * 0.20;
  const carLoanAmount = carPrice - carDownPayment;
  const monthlyRate = 0.049 / 12; // 4.9% annual rate divided by 12 months
  const numPayments = 60; // 60 months
  const monthlyCarPayment = carLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyCarInsurance = carPrice * 0.012 / 12; // 1.2% annually for insurance
  const monthlyCarMaintenance = carPrice * 0.01 / 12; // 1% annually for maintenance
  const totalMonthlyCarCost = hasCar ? monthlyCarPayment + monthlyCarInsurance + monthlyCarMaintenance : 0;

  // Calculate monthly take-home and expenses
  const calculateAfterTaxIncome = (salary: number) => {
    let federalTax = 0;
    if (salary <= 11600) federalTax = salary * 0.10;
    else if (salary <= 47150) federalTax = 1160 + (salary - 11600) * 0.12;
    else if (salary <= 100525) federalTax = 5428 + (salary - 47150) * 0.22;
    else if (salary <= 191950) federalTax = 17470 + (salary - 100525) * 0.24;
    else federalTax = 41847 + (salary - 191950) * 0.32;
    
    let njTax = 0;
    if (salary <= 20000) njTax = salary * 0.014;
    else if (salary <= 35000) njTax = 280 + (salary - 20000) * 0.0175;
    else if (salary <= 40000) njTax = 542.50 + (salary - 40000) * 0.035;
    else if (salary <= 75000) njTax = 717.50 + (salary - 40000) * 0.05525;
    else if (salary <= 500000) njTax = 2665.63 + (salary - 75000) * 0.0637;
    else njTax = 30365.63 + (salary - 500000) * 0.0899;
    
    return salary - federalTax - njTax;
  };

  const afterTaxIncome = calculateAfterTaxIncome(currentSalary);
  const monthlyTakeHome = afterTaxIncome / 12;
  
  const monthlyExpenses = 200 + 300 + 200 + 500 + 300; // Utilities + Groceries + Entertainment + Savings + Other
  const totalExpenses = monthlyExpenses + totalMonthlyHousingCost + totalMonthlyCarCost + monthlySP500Investment + (hasRental ? monthlyRent : 0);
  const availableMonthlyIncome = monthlyTakeHome - totalExpenses;

  // Calculate accumulated money based on years simulated
  const calculateAccumulatedMoney = () => {
    if (currentYear <= 1) return 0; // No money accumulated in year 1
    
    let accumulated = 0;
    let currentSalaryForYear = currentSalary;
    
    // Calculate money accumulated for each completed year
    for (let year = 1; year < currentYear; year++) {
      // Calculate after-tax income for this year
      let federalTax = 0;
      if (currentSalaryForYear <= 11600) federalTax = currentSalaryForYear * 0.10;
      else if (currentSalaryForYear <= 47150) federalTax = 1160 + (currentSalaryForYear - 11600) * 0.12;
      else if (currentSalaryForYear <= 100525) federalTax = 5428 + (currentSalaryForYear - 47150) * 0.22;
      else if (currentSalaryForYear <= 191950) federalTax = 17470 + (currentSalaryForYear - 100525) * 0.24;
      else federalTax = 41847 + (currentSalaryForYear - 191950) * 0.32;
      
      let njTax = 0;
      if (currentSalaryForYear <= 20000) njTax = currentSalaryForYear * 0.014;
      else if (currentSalaryForYear <= 35000) njTax = 280 + (currentSalaryForYear - 20000) * 0.0175;
      else if (currentSalaryForYear <= 40000) njTax = 542.50 + (currentSalaryForYear - 35000) * 0.035;
      else if (currentSalaryForYear <= 75000) njTax = 717.50 + (currentSalaryForYear - 40000) * 0.05525;
      else if (currentSalaryForYear <= 500000) njTax = 2665.63 + (currentSalaryForYear - 75000) * 0.0637;
      else njTax = 30365.63 + (currentSalaryForYear - 500000) * 0.0899;
      
      const yearlyAfterTax = currentSalaryForYear - federalTax - njTax;
      const monthlyTakeHomeForYear = yearlyAfterTax / 12;
      
      // Calculate expenses for this year (including house if purchased and monthly investment)
      const monthlyExpenses = 200 + 300 + 200 + 500 + 300; // Utilities + Groceries + Entertainment + Savings + Other
      const monthlyHousingExpenses = hasHouse ? totalMonthlyHousingCost : 0;
      const monthlyCarExpenses = hasCar ? totalMonthlyCarCost : 0;
      const monthlyInvestmentExpense = monthlySP500Investment;
      const monthlyRentalExpense = hasRental ? monthlyRent : 0;
      const totalMonthlyExpenses = monthlyExpenses + monthlyHousingExpenses + monthlyCarExpenses + monthlyInvestmentExpense + monthlyRentalExpense;
      
      const monthlyNetForYear = monthlyTakeHomeForYear - totalMonthlyExpenses;
      const yearlyNetForYear = Math.max(monthlyNetForYear * 12, 0);
      
      accumulated += yearlyNetForYear;
      
      // Apply salary growth for next year
      currentSalaryForYear = currentSalaryForYear * 1.05; // 5% growth
    }
    
    return accumulated;
  };

  const accumulatedMoney = calculateAccumulatedMoney();

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 Life Simulator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Make life decisions and see how they affect your future
          </p>
        </div>

        {/* Header with Reset Button */}
        <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md p-1">
            {["Simulator", "Purchases", "Investments", "Financial Status"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setShowResetWarning(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Reset All
          </button>
        </div>

        {/* Reset Warning Modal */}
        {showResetWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                ⚠️ Reset Everything?
              </h3>
              <p className="text-gray-700 mb-6">
                This will reset all your progress, age, salary, and house decisions back to the beginning. 
                This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetWarning(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simulator Tab */}
        {activeTab === "Simulator" && (
          <SimulatorTab
            form={form}
            setForm={setForm}
            currentYear={currentYear}
            currentAge={currentAge}
            currentSalary={currentSalary}
            onSimulate={simulateYear}
            hasHouse={hasHouse}
            hasRental={hasRental}
            onGoToPurchases={goToPurchases}
          />
        )}

        {/* Purchases Tab */}
        {activeTab === "Purchases" && (
          <PurchasesTab
            currentSalary={currentSalary}
            currentAge={currentAge}
            hasHouse={hasHouse}
            housePrice={housePrice}
            setHousePrice={setHousePrice}
            onBuyHouse={handleBuyHouse}
            hasCar={hasCar}
            carPrice={carPrice}
            setCarPrice={setCarPrice}
            onBuyCar={handleBuyCar}
            hasRental={hasRental}
            selectedRental={selectedRental}
            monthlyRent={monthlyRent}
            onRentApartment={handleRentApartment}
            onEndLease={handleEndLease}
            onUpgradeApartment={handleUpgradeApartment}
            accumulatedMoney={accumulatedMoney}
            downPayment={housePrice * 0.10}
            totalMonthlyHousingCost={totalMonthlyHousingCost}
            totalMonthlyCarCost={totalMonthlyCarCost}
          />
        )}

        {/* Investments Tab */}
        {activeTab === "Investments" && (
          <InvestmentsTab
            currentYear={currentYear}
            currentAge={currentAge}
            monthlySP500Investment={monthlySP500Investment}
            setMonthlySP500Investment={setMonthlySP500Investment}
            totalSP500Value={totalSP500Value}
            monthlyTakeHome={monthlyTakeHome}
            monthlyExpenses={totalExpenses}
            availableMonthlyIncome={availableMonthlyIncome}
          />
        )}

        {/* Financial Status Tab */}
        {activeTab === "Financial Status" && (
          <FinancialStatusTab
            currentSalary={currentSalary}
            hasHouse={hasHouse}
            housePrice={housePrice}
            downPayment={housePrice * 0.10}
            totalMonthlyHousingCost={totalMonthlyHousingCost}
            currentYear={currentYear}
            monthlySP500Investment={monthlySP500Investment}
            totalSP500Value={totalSP500Value}
            hasCar={hasCar}
            carPrice={carPrice}
            totalMonthlyCarCost={totalMonthlyCarCost}
            hasRental={hasRental}
            selectedRental={selectedRental}
            monthlyRent={monthlyRent}
            afterTaxIncome={afterTaxIncome}
            accumulatedMoney={accumulatedMoney}
          />
        )}
      </div>
    </div>
  );
}