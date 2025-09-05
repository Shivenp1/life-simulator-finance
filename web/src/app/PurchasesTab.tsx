import { useState } from 'react';

interface PurchasesTabProps {
  currentSalary: number;
  currentAge: number;
  hasHouse: boolean;
  housePrice: number;
  setHousePrice: (price: number) => void;
  onBuyHouse: () => void;
  hasCar: boolean;
  carPrice: number;
  setCarPrice: (price: number) => void;
  onBuyCar: () => void;
}

export const PurchasesTab = ({
  currentSalary,
  currentAge,
  hasHouse,
  housePrice,
  setHousePrice,
  onBuyHouse,
  hasCar,
  carPrice,
  setCarPrice,
  onBuyCar
}: PurchasesTabProps) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(10); // Default 10%
  
  const downPayment = housePrice * (downPaymentPercent / 100);
  const loanAmount = housePrice - downPayment;
  const monthlyMortgage = loanAmount * 0.065 / 12; // 6.5% rate, 30 years
  
  // Calculate property taxes (typically 1-2% of home value annually)
  const annualPropertyTaxes = housePrice * 0.015; // 1.5% annually
  const monthlyPropertyTaxes = annualPropertyTaxes / 12;
  
  // Calculate home insurance (typically 0.25-0.5% of home value annually)
  const annualHomeInsurance = housePrice * 0.0035; // 0.35% annually
  const monthlyHomeInsurance = annualHomeInsurance / 12;
  
  // Calculate PMI (typically 0.5-1% of loan amount annually, only if down payment < 20%)
  const pmiRate = downPaymentPercent < 20 ? 0.007 : 0; // 0.7% if < 20% down
  const annualPMI = loanAmount * pmiRate;
  const monthlyPMI = annualPMI / 12;
  
  const totalMonthlyPayment = monthlyMortgage + monthlyPropertyTaxes + monthlyHomeInsurance + monthlyPMI;

  
  // Car calculations
  const carDownPayment = carPrice * 0.20; // 20% down for cars
  const carLoanAmount = carPrice - carDownPayment;
  
  // Proper car loan calculation with 4.9% APR for 60 months
  const monthlyRate = 0.049 / 12; // 4.9% annual rate divided by 12 months
  const numPayments = 60; // 60 months
  const monthlyCarPayment = carLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const monthlyCarInsurance = carPrice * 0.012 / 12; // 1.2% annually for insurance
  const monthlyCarMaintenance = carPrice * 0.01 / 12; // 1% annually for maintenance
  const totalMonthlyCarCost = monthlyCarPayment + monthlyCarInsurance + monthlyCarMaintenance;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* House Purchase Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🏠 House Purchase
        </h3>
        
        {!hasHouse ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You're {currentAge} years old with a salary of ${currentSalary.toLocaleString()}. 
              Would you like to buy a house?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Price ($)
                </label>
                <input
                  type="number"
                  value={housePrice === 0 ? '' : housePrice}
                  onChange={(e) => setHousePrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                  placeholder="350000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment (%)
                </label>
                <input
                  type="number"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value) || 0)}
                  min="3"
                  max="50"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                />
              </div>
            </div>
            
            {housePrice > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3">Monthly Payment Breakdown:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Mortgage Payment (6.5% APR):</span>
                    <span className="font-bold text-gray-900">${monthlyMortgage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Property Taxes (1.5% annually):</span>
                    <span className="font-bold text-gray-900">${monthlyPropertyTaxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Home Insurance (0.35% annually):</span>
                    <span className="font-bold text-gray-900">${monthlyHomeInsurance.toLocaleString()}</span>
                  </div>
                  {monthlyPMI > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-800 font-medium">PMI (0.7% annually):</span>
                      <span className="font-bold text-gray-900">${monthlyPMI.toLocaleString()}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900">Total Monthly Payment:</span>
                    <span className="text-red-700">${totalMonthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-900 font-medium">
                    <strong>Down Payment ({downPaymentPercent}%):</strong> ${downPayment.toLocaleString()}
                    {downPaymentPercent < 20 && (
                      <span className="block text-xs text-orange-800 font-semibold mt-1">
                        ⚠️ PMI required (down payment less than 20%)
                      </span>
                    )}
                    {downPaymentPercent >= 20 && (
                      <span className="block text-xs text-green-800 font-semibold mt-1">
                        ✅ No PMI required (down payment 20% or more)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={onBuyHouse}
              disabled={housePrice === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🏠 Buy This House!
            </button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">✅ House Purchased!</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>House Value:</strong> ${housePrice.toLocaleString()}</p>
              <p><strong>Down Payment ({downPaymentPercent}%):</strong> ${downPayment.toLocaleString()}</p>
              <div className="mt-3 p-3 bg-white rounded border">
                <h5 className="font-medium text-gray-800 mb-2">Monthly Payment Breakdown:</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Mortgage Payment:</span>
                    <span>${monthlyMortgage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Property Taxes:</span>
                    <span>${monthlyPropertyTaxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home Insurance:</span>
                    <span>${monthlyHomeInsurance.toLocaleString()}</span>
                  </div>
                  {monthlyPMI > 0 && (
                    <div className="flex justify-between">
                      <span>PMI:</span>
                      <span>${monthlyPMI.toLocaleString()}</span>
                    </div>
                  )}
                  <hr className="my-1" />
                  <div className="flex justify-between font-bold">
                    <span>Total Monthly Payment:</span>
                    <span className="text-red-600">${totalMonthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Car Purchase Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🚗 Car Purchase
        </h3>
        
        {!hasCar ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You're {currentAge} years old with a salary of ${currentSalary.toLocaleString()}. 
              Would you like to buy a car?
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Price ($)
              </label>
              <input
                type="number"
                value={carPrice === 0 ? '' : carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                placeholder="25000"
              />
            </div>
            
            {carPrice > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3">Monthly Payment Breakdown:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Car Payment (4.9% APR, 5 years):</span>
                    <span className="font-bold text-gray-900">${monthlyCarPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Car Insurance (1.2% annually):</span>
                    <span className="font-bold text-gray-900">${monthlyCarInsurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Maintenance (1% annually):</span>
                    <span className="font-bold text-gray-900">${monthlyCarMaintenance.toLocaleString()}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900">Total Monthly Cost:</span>
                    <span className="text-red-700">${totalMonthlyCarCost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-900 font-medium">
                    <strong>Down Payment (20%):</strong> ${carDownPayment.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={onBuyCar}
              disabled={carPrice === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚗 Buy This Car!
            </button>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">✅ Car Purchased!</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Car Value:</strong> ${carPrice.toLocaleString()}</p>
              <p><strong>Down Payment (20%):</strong> ${carDownPayment.toLocaleString()}</p>
              <div className="mt-3 p-3 bg-white rounded border">
                <h5 className="font-medium text-gray-800 mb-2">Monthly Cost Breakdown:</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Car Payment:</span>
                    <span>${monthlyCarPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance:</span>
                    <span>${monthlyCarInsurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span>${monthlyCarMaintenance.toLocaleString()}</span>
                  </div>
                  <hr className="my-1" />
                  <div className="flex justify-between font-bold">
                    <span>Total Monthly Cost:</span>
                    <span className="text-red-600">${totalMonthlyCarCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Future Purchase Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🎓 Future Purchases
        </h3>
        <p className="text-gray-500 text-sm">
          More purchase options coming soon! (Education, investments, etc.)
        </p>
      </div>
    </div>
  );
};


