import { InputField } from './InputField';

interface SimulatorTabProps {
  form: {
    age: number;
    startingSalary: number;
    salaryGrowthPercent: number;
  };
  setForm: (form: any) => void;
  currentYear: number;
  currentAge: number;
  currentSalary: number;
  onSimulate: () => void;
}

export const SimulatorTab = ({
  form,
  setForm,
  currentYear,
  currentAge,
  currentSalary,
  onSimulate
}: SimulatorTabProps) => (
  <div className="max-w-md mx-auto space-y-6">
    {/* Input Form */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Starting Information
      </h3>
      <div className="space-y-4">
        <InputField
          label="Age"
          value={form.age}
          onChange={(e) => setForm({...form, age: Number(e.target.value) || 0})}
        />
        <InputField
          label="Starting Salary ($)"
          value={form.startingSalary}
          onChange={(e) => setForm({...form, startingSalary: Number(e.target.value) || 0})}
        />
        <InputField
          label="Annual Growth (%)"
          value={form.salaryGrowthPercent}
          onChange={(e) => setForm({...form, salaryGrowthPercent: Number(e.target.value) || 0})}
          step={0.1}
        />
      </div>
    </div>

    {/* Simulation Button */}
    <div className="text-center">
      <button
        onClick={onSimulate}
        className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
      >
        Simulate One Year
      </button>
    </div>

    {/* Current Status */}
    {currentYear > 1 && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Year {currentYear - 1} Results
        </h3>
        <div className="space-y-2 text-gray-700">
          <p><strong>Age:</strong> {currentAge}</p>
          <p><strong>Salary:</strong> ${currentSalary.toLocaleString()}</p>
        </div>
      </div>
    )}
  </div>
);