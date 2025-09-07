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
  hasRental: boolean;
  selectedRental: any;
  monthlyRent: number;
  onRentApartment: (rental: any) => void;
  onEndLease: () => void;
  onUpgradeApartment: (rental: any) => void;
  accumulatedMoney: number;
  downPayment: number;
  totalMonthlyHousingCost: number;
  totalMonthlyCarCost: number;
  gameMode: 'game' | 'serious';
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
  onBuyCar,
  hasRental,
  selectedRental,
  monthlyRent,
  onRentApartment,
  onEndLease,
  onUpgradeApartment,
  accumulatedMoney,
  downPayment,
  totalMonthlyHousingCost,
  totalMonthlyCarCost,
  gameMode
}: PurchasesTabProps) => {
  const [showApartmentDetails, setShowApartmentDetails] = useState<any>(null);

  // Apartment data with realistic pricing
  const apartments = [
    {
      id: 1,
      name: "Studio Apartment",
      bedrooms: 0,
      bathrooms: 1,
      sqft: 500,
      monthlyRent: 1200,
      location: "Downtown",
      amenities: ["Gym", "Laundry", "Parking"],
      description: "Cozy studio perfect for young professionals"
    },
    {
      id: 2,
      name: "1 Bedroom Apartment",
      bedrooms: 1,
      bathrooms: 1,
      sqft: 750,
      monthlyRent: 1800,
      location: "Midtown",
      amenities: ["Gym", "Pool", "Laundry", "Parking"],
      description: "Spacious 1-bedroom with modern amenities"
    },
    {
      id: 3,
      name: "2 Bedroom Apartment",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      monthlyRent: 2800,
      location: "Uptown",
      amenities: ["Gym", "Pool", "Laundry", "Parking", "Balcony"],
      description: "Perfect for roommates or growing families"
    },
    {
      id: 4,
      name: "3 Bedroom Apartment",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1400,
      monthlyRent: 3800,
      location: "Suburbs",
      amenities: ["Gym", "Pool", "Laundry", "Parking", "Balcony", "Storage"],
      description: "Large family-friendly apartment"
    },
    {
      id: 5,
      name: "Luxury Penthouse",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      monthlyRent: 4500,
      location: "Downtown",
      amenities: ["Gym", "Pool", "Concierge", "Parking", "City View", "Rooftop"],
      description: "Premium penthouse with stunning city views"
    },
    {
      id: 6,
      name: "Budget Studio",
      bedrooms: 0,
      bathrooms: 1,
      sqft: 400,
      monthlyRent: 900,
      location: "Outskirts",
      amenities: ["Laundry"],
      description: "Affordable option for budget-conscious renters"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* House Purchase Section */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-green-900' : 'text-gray-800'}`}>
          🏠 House Purchase
        </h3>
        
        {!hasHouse ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You're {currentAge} years old with a salary of ${currentSalary.toLocaleString()}. 
              {gameMode === 'game' ? ' Time to buy your dream home! 🏡' : ' Consider purchasing a house for long-term wealth building.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House Price ($)
                </label>
                <input
                  type="number"
                  value={housePrice || ''}
                  onChange={(e) => setHousePrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="300000"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Down Payment (10%):</span> ${downPayment.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Monthly Payment:</span> ${totalMonthlyHousingCost.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Available Money:</span> ${accumulatedMoney.toLocaleString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={onBuyHouse}
              disabled={accumulatedMoney < downPayment}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                accumulatedMoney >= downPayment
                  ? gameMode === 'game' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {accumulatedMoney >= downPayment ? 'Buy House' : 'Insufficient Funds'}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ House Owned!</h4>
            <p className="text-green-700">
              You own a house worth ${housePrice.toLocaleString()} with a monthly payment of ${totalMonthlyHousingCost.toLocaleString()}.
            </p>
          </div>
        )}
      </div>

      {/* Car Purchase Section */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-blue-900' : 'text-gray-800'}`}>
          🚗 Car Purchase
        </h3>
        
        {!hasCar ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              {gameMode === 'game' ? 'Ready to hit the road? 🚗💨' : 'Consider purchasing a car for transportation.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Price ($)
                </label>
                <input
                  type="number"
                  value={carPrice || ''}
                  onChange={(e) => setCarPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Down Payment (20%):</span> ${(carPrice * 0.20).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Monthly Payment:</span> ${totalMonthlyCarCost.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Available Money:</span> ${accumulatedMoney.toLocaleString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={onBuyCar}
              disabled={accumulatedMoney < (carPrice * 0.20)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                accumulatedMoney >= (carPrice * 0.20)
                  ? gameMode === 'game' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {accumulatedMoney >= (carPrice * 0.20) ? 'Buy Car' : 'Insufficient Funds'}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">✅ Car Owned!</h4>
            <p className="text-blue-700">
              You own a car worth ${carPrice.toLocaleString()} with a monthly payment of ${totalMonthlyCarCost.toLocaleString()}.
            </p>
          </div>
        )}
      </div>

      {/* Rental Properties Section */}
      <div className={`rounded-lg shadow-md p-6 ${gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>
          �� Rental Properties
        </h3>
        
        {!hasRental ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You're {currentAge} years old with a salary of ${currentSalary.toLocaleString()}. 
              {gameMode === 'game' ? ' Browse available apartments and find your perfect rental! 🏠✨' : ' Browse available apartments and find your perfect rental.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apartments.map((apartment) => (
                <div key={apartment.id} className={`p-4 rounded-lg border-2 ${gameMode === 'game' ? 'bg-white border-purple-200 hover:border-purple-400' : 'bg-gray-50 border-gray-200 hover:border-gray-400'} transition-colors`}>
                  <h4 className="font-semibold text-gray-800 mb-2">{apartment.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📍 {apartment.location}</p>
                    <p>🛏️ {apartment.bedrooms} bed • 🚿 {apartment.bathrooms} bath</p>
                    <p>📐 {apartment.sqft} sq ft</p>
                    <p className="font-semibold text-green-600">${apartment.monthlyRent.toLocaleString()}/month</p>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => setShowApartmentDetails(apartment)}
                      className="flex-1 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onRentApartment(apartment)}
                      disabled={accumulatedMoney < (apartment.monthlyRent * 1.5)}
                      className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                        accumulatedMoney >= (apartment.monthlyRent * 1.5)
                          ? gameMode === 'game' 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Rent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ Currently Renting!</h4>
              <div className="space-y-1 text-green-700">
                <p><span className="font-medium">Apartment:</span> {selectedRental?.name}</p>
                <p><span className="font-medium">Location:</span> {selectedRental?.location}</p>
                <p><span className="font-medium">Monthly Rent:</span> ${monthlyRent.toLocaleString()}</p>
                <p><span className="font-medium">Security Deposit:</span> ${(monthlyRent * 1.5).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onEndLease}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Lease
              </button>
              <button
                onClick={() => setShowApartmentDetails(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Other Apartments
              </button>
            </div>
            
            {showApartmentDetails === null && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apartments.filter(apt => apt.id !== selectedRental?.id).map((apartment) => (
                  <div key={apartment.id} className={`p-4 rounded-lg border-2 ${gameMode === 'game' ? 'bg-white border-purple-200 hover:border-purple-400' : 'bg-gray-50 border-gray-200 hover:border-gray-400'} transition-colors`}>
                    <h4 className="font-semibold text-gray-800 mb-2">{apartment.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📍 {apartment.location}</p>
                      <p>🛏️ {apartment.bedrooms} bed • 🚿 {apartment.bathrooms} bath</p>
                      <p>📐 {apartment.sqft} sq ft</p>
                      <p className="font-semibold text-green-600">${apartment.monthlyRent.toLocaleString()}/month</p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => setShowApartmentDetails(apartment)}
                        className="flex-1 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => onUpgradeApartment(apartment)}
                        disabled={accumulatedMoney < ((apartment.monthlyRent - monthlyRent) * 1.5)}
                        className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                          accumulatedMoney >= ((apartment.monthlyRent - monthlyRent) * 1.5)
                            ? gameMode === 'game' 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apartment Details Modal */}
      {showApartmentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{showApartmentDetails.name}</h3>
              <button
                onClick={() => setShowApartmentDetails(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Location:</span>
                  <p className="text-gray-900">📍 {showApartmentDetails.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Size:</span>
                  <p className="text-gray-900">📐 {showApartmentDetails.sqft} sq ft</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Bedrooms:</span>
                  <p className="text-gray-900">🛏️ {showApartmentDetails.bedrooms}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Bathrooms:</span>
                  <p className="text-gray-900">🚿 {showApartmentDetails.bathrooms}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Monthly Rent:</span>
                <p className="text-2xl font-bold text-green-600">${showApartmentDetails.monthlyRent.toLocaleString()}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Security Deposit:</span>
                <p className="text-lg font-semibold text-blue-600">${(showApartmentDetails.monthlyRent * 1.5).toLocaleString()}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Amenities:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {showApartmentDetails.amenities.map((amenity: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Description:</span>
                <p className="text-gray-700 mt-1">{showApartmentDetails.description}</p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    if (!hasRental) {
                      onRentApartment(showApartmentDetails);
                    } else {
                      onUpgradeApartment(showApartmentDetails);
                    }
                    setShowApartmentDetails(null);
                  }}
                  disabled={!hasRental ? accumulatedMoney < (showApartmentDetails.monthlyRent * 1.5) : accumulatedMoney < ((showApartmentDetails.monthlyRent - monthlyRent) * 1.5)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    (!hasRental && accumulatedMoney >= (showApartmentDetails.monthlyRent * 1.5)) || 
                    (hasRental && accumulatedMoney >= ((showApartmentDetails.monthlyRent - monthlyRent) * 1.5))
                      ? gameMode === 'game' 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!hasRental ? 'Rent This Apartment' : 'Upgrade to This Apartment'}
                </button>
                <button
                  onClick={() => setShowApartmentDetails(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};