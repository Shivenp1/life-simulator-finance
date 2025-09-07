interface SimulatorTabProps {
  form: {
    startingSalary: number;
    salaryGrowthPercent: number;
    age: number;
  };
  setForm: (form: any) => void;
  currentYear: number;
  currentAge: number;
  currentSalary: number;
  onSimulate: () => void;
  hasHouse: boolean;
  hasRental: boolean;
  onGoToPurchases: () => void;
}

export const SimulatorTab = ({
  form,
  setForm,
  currentYear,
  currentAge,
  currentSalary,
  onSimulate,
  hasHouse,
  hasRental,
  onGoToPurchases
}: SimulatorTabProps) => {
  const canAdvance = currentYear === 1 || hasHouse || hasRental;
  const hasHousing = hasHouse || hasRental;
  
  const inputClassName = "w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium";
  
  const getHousingStatus = () => {
    if (currentYear === 1) return { text: 'Not Required', color: 'text-blue-700' };
    if (hasHousing) return { text: hasHouse ? 'House' : 'Apartment', color: 'text-green-700' };
    return { text: 'Required', color: 'text-red-700' };
  };

  const housingStatus = getHousingStatus();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Life Simulator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Starting Salary ($)
            </label>
            <input
              type="number"
              value={form.startingSalary || ''}
              onChange={(e) => setForm({...form, startingSalary: parseInt(e.target.value) || 0})}
              className={inputClassName}
              placeholder="50000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Starting Age
            </label>
            <input
              type="number"
              value={form.age || ''}
              onChange={(e) => setForm({...form, age: parseInt(e.target.value) || 0})}
              className={inputClassName}
              placeholder="22"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Annual Salary Growth (%)
            </label>
            <input
              type="number"
              value={form.salaryGrowthPercent || ''}
              onChange={(e) => setForm({...form, salaryGrowthPercent: parseInt(e.target.value) || 0})}
              className={inputClassName}
              placeholder="5"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 text-lg">Current Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-700 font-medium">Year:</span>
              <span className="font-bold text-gray-900 ml-2 text-lg">{currentYear}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-700 font-medium">Age:</span>
              <span className="font-bold text-gray-900 ml-2 text-lg">{currentAge}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-700 font-medium">Salary:</span>
              <span className="font-bold text-gray-900 ml-2 text-lg">${currentSalary.toLocaleString()}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-700 font-medium">Housing:</span>
              <span className={`font-bold ml-2 text-lg ${housingStatus.color}`}>
                {housingStatus.text}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          {canAdvance ? (
            <button
              onClick={onSimulate}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              {currentYear === 1 ? 'Complete First Year' : 'Advance to Next Year'}
            </button>
          ) : (
            <button
              onClick={onGoToPurchases}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Go to Purchases to Buy Housing
            </button>
          )}
        </div>
        
        {!canAdvance && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm font-semibold text-red-900">
              ⚠️ You must purchase a house or rent an apartment before advancing to year {currentYear + 1}.
            </p>
            <p className="text-sm text-red-800 mt-1">
              Click the button above to go to the Purchases tab and buy a house or rent an apartment.
            </p>
          </div>
        )}

        {currentYear === 1 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm font-semibold text-yellow-900">
              ℹ️ Complete your first year to start earning money and then you'll need to buy housing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};