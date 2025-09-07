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
  // Pass calculated values from parent instead of calculating here
  downPayment: number;
  totalMonthlyHousingCost: number;
  totalMonthlyCarCost: number;
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
  totalMonthlyCarCost
}: PurchasesTabProps) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(10);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  // Apartment data - could be moved to separate file
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
      description: "Spacious 1BR with modern amenities"
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
      description: "Luxury 2BR with premium features"
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
      description: "Family-friendly 3BR with extra space"
    },
    {
      id: 5,
      name: "Luxury Penthouse",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      monthlyRent: 4500,
      location: "Downtown",
      amenities: ["Gym", "Pool", "Laundry", "Valet Parking", "Rooftop Access", "Concierge"],
      description: "Premium penthouse with city views"
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
      description: "Affordable studio for budget-conscious renters"
    }
  ];

  // Filter apartments to show only upgrades (higher rent) or all if no current rental
  const availableApartments = hasRental 
    ? apartments.filter(apt => apt.monthlyRent > monthlyRent)
    : apartments;

  const handleUpgradeApartment = (newApartment: any) => {
    onUpgradeApartment(newApartment);
    setShowUpgradeOptions(false);
  };

  // Reusable component for purchase sections
  const PurchaseSection = ({ 
    title, 
    emoji, 
    hasItem, 
    price, 
    setPrice, 
    onBuy, 
    placeholder, 
    buttonText, 
    buttonEmoji,
    showPriceInput = true,
    showDownPaymentInput = false,
    downPaymentPercent,
    setDownPaymentPercent,
    downPayment,
    totalMonthlyCost,
    itemName
  }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {emoji} {title}
      </h3>
      
      {!hasItem ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            You're {currentAge} years old with a salary of ${currentSalary.toLocaleString()}. 
            Would you like to buy a {itemName}?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showPriceInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {itemName} Price ($)
                </label>
                <input
                  type="number"
                  value={price === 0 ? '' : price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                  placeholder={placeholder}
                />
              </div>
            )}
            
            {showDownPaymentInput && (
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
            )}
          </div>
          
          {price > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">Monthly Cost Breakdown:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-800 font-medium">Total Monthly Cost:</span>
                  <span className="font-bold text-gray-900">${totalMonthlyCost.toLocaleString()}</span>
                </div>
                {showDownPaymentInput && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong>Down Payment ({downPaymentPercent}%):</strong> ${downPayment.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={onBuy}
            disabled={price === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonEmoji} {buttonText}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">✅ {itemName} Purchased!</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>{itemName} Value:</strong> ${price.toLocaleString()}</p>
            {showDownPaymentInput && (
              <p><strong>Down Payment ({downPaymentPercent}%):</strong> ${downPayment.toLocaleString()}</p>
            )}
            <div className="mt-3 p-3 bg-white rounded border">
              <h5 className="font-medium text-gray-800 mb-2">Monthly Cost Breakdown:</h5>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Monthly Cost:</span>
                  <span>${totalMonthlyCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* House Purchase Section */}
      <PurchaseSection
        title="House Purchase"
        emoji=""
        hasItem={hasHouse}
        price={housePrice}
        setPrice={setHousePrice}
        onBuy={onBuyHouse}
        placeholder="350000"
        buttonText="Buy This House!"
        buttonEmoji=""
        showPriceInput={true}
        showDownPaymentInput={true}
        downPaymentPercent={downPaymentPercent}
        setDownPaymentPercent={setDownPaymentPercent}
        downPayment={downPayment}
        totalMonthlyCost={totalMonthlyHousingCost}
        itemName="House"
      />

      {/* Car Purchase Section */}
      <PurchaseSection
        title="Car Purchase"
        emoji=""
        hasItem={hasCar}
        price={carPrice}
        setPrice={setCarPrice}
        onBuy={onBuyCar}
        placeholder="25000"
        buttonText="Buy This Car!"
        buttonEmoji=""
        showPriceInput={true}
        showDownPaymentInput={false}
        totalMonthlyCost={totalMonthlyCarCost}
        itemName="Car"
      />

      {/* Rental Properties Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
           Rental Properties
        </h3>
        
        {!hasRental ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You're {currentAge} years old with a salary of ${currentSalary.toLocaleString()}. 
              Browse available apartments and find your perfect rental!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apartments.map((apartment) => (
                <div key={apartment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{apartment.name}</h4>
                    <span className="text-lg font-bold text-green-600">${apartment.monthlyRent.toLocaleString()}/mo</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} BR`} • {apartment.bathrooms} BA • {apartment.sqft} sqft</p>
                    <p className="text-blue-600">📍 {apartment.location}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{apartment.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {apartment.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {apartment.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{apartment.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedApartment(apartment);
                        setShowApartmentDetails(true);
                      }}
                      className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => onRentApartment(apartment)}
                      disabled={accumulatedMoney < apartment.monthlyRent * 1.5}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {accumulatedMoney < apartment.monthlyRent * 1.5 
                        ? `Need $${(apartment.monthlyRent * 1.5).toLocaleString()} for deposit`
                        : 'Rent This Apartment'
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Apartment Display */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-green-800 text-lg">✅ Current Apartment</h4>
                <span className="text-xl font-bold text-green-600">${monthlyRent.toLocaleString()}/mo</span>
              </div>
              
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>Apartment:</strong> {selectedRental?.name}</p>
                <p><strong>Location:</strong> {selectedRental?.location}</p>
                <p><strong>Size:</strong> {selectedRental?.bedrooms === 0 ? 'Studio' : `${selectedRental?.bedrooms} BR`} • {selectedRental?.bathrooms} BA • {selectedRental?.sqft} sqft</p>
                <p><strong>Security Deposit:</strong> ${(monthlyRent * 1.5).toLocaleString()}</p>
                
                <div className="mt-3 p-3 bg-white rounded border">
                  <h5 className="font-medium text-gray-800 mb-2">Monthly Cost Breakdown:</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Rent:</span>
                      <span>${monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilities (estimated):</span>
                      <span>${Math.round(monthlyRent * 0.1).toLocaleString()}</span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between font-bold">
                      <span>Total Monthly Cost:</span>
                      <span className="text-red-600">${(monthlyRent + Math.round(monthlyRent * 0.1)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apartment Management Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeOptions(true)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                 Upgrade Apartment
              </button>
              <button
                onClick={onEndLease}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🚪 End Lease
              </button>
            </div>

            {/* Upgrade Options */}
            {showUpgradeOptions && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-blue-800">Available Upgrades</h5>
                  <button
                    onClick={() => setShowUpgradeOptions(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </div>
                
                {availableApartments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {availableApartments.map((apartment) => {
                      const additionalDeposit = (apartment.monthlyRent * 1.5) - (monthlyRent * 1.5);
                      return (
                        <div key={apartment.id} className="border border-blue-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-semibold text-gray-800">{apartment.name}</h6>
                            <span className="text-lg font-bold text-green-600">${apartment.monthlyRent.toLocaleString()}/mo</span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <p>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} BR`} • {apartment.bathrooms} BA • {apartment.sqft} sqft</p>
                            <p className="text-blue-600">📍 {apartment.location}</p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <p className="text-gray-600">Additional deposit needed:</p>
                              <p className="font-medium text-orange-600">${additionalDeposit.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => handleUpgradeApartment(apartment)}
                              disabled={accumulatedMoney < additionalDeposit}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {accumulatedMoney < additionalDeposit 
                                ? 'Need More Money'
                                : 'Upgrade'
                              }
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-blue-700 text-sm">No upgrade options available. You're already in the most expensive apartment!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apartment Details Modal */}
      {showApartmentDetails && selectedApartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedApartment.name}</h3>
              <button
                onClick={() => setShowApartmentDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${selectedApartment.monthlyRent.toLocaleString()}/month
                </div>
                <div className="text-sm text-gray-600">
                  Security Deposit: ${(selectedApartment.monthlyRent * 1.5).toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Bedrooms:</span> {selectedApartment.bedrooms === 0 ? 'Studio' : selectedApartment.bedrooms}
                </div>
                <div>
                  <span className="font-medium">Bathrooms:</span> {selectedApartment.bathrooms}
                </div>
                <div>
                  <span className="font-medium">Square Feet:</span> {selectedApartment.sqft}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {selectedApartment.location}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedApartment.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApartment.amenities.map((amenity: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowApartmentDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onRentApartment(selectedApartment);
                    setShowApartmentDetails(false);
                  }}
                  disabled={accumulatedMoney < selectedApartment.monthlyRent * 1.5}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rent This Apartment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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