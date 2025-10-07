"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SimulatorTab } from "../SimulatorTab"
import { FinancialStatusTab } from "../FinancialStatusTab"
import { PurchasesTab } from "../PurchasesTab"
import { InvestmentsTab } from "../InvestmentsTab"
import { OptimizationTab } from "../OptimizationTab"

interface FinancialPlan {
  id: string
  name: string
  description?: string
  gameMode: string
  startingSalary: number
  salaryGrowthPercent: number
  age: number
  currentYear: number
  currentAge: number
  currentSalary: number
  totalSavings: number
  housePrice: number
  hasHouse: boolean
  carPrice: number
  hasCar: boolean
  hasRental: boolean
  selectedRental?: string
  monthlyRent: number
  monthlySP500Investment: number
  totalSP500Value: number
  selectedInvestmentStrategy: string
  achievements?: string
  simulationHistory: Array<{
    year: number
    age: number
    salary: number
    totalSavings: number
    totalSP500Value: number
    monthlySP500Investment: number
    hasHouse: boolean
    hasCar: boolean
    hasRental: boolean
    monthlyRent: number
    investmentReturn?: number
    investmentStrategy?: string
    achievements?: string
  }>
}

export default function SimulatorPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plan, setPlan] = useState<FinancialPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Simulator")
  
  // State for the simulation
  const [form, setForm] = useState({
    startingSalary: 0,
    salaryGrowthPercent: 0,
    age: 0,
  })
  const [currentYear, setCurrentYear] = useState(1)
  const [currentAge, setCurrentAge] = useState(0)
  const [currentSalary, setCurrentSalary] = useState(0)
  const [housePrice, setHousePrice] = useState(0)
  const [hasHouse, setHasHouse] = useState(false)
  const [carPrice, setCarPrice] = useState(0)
  const [hasCar, setHasCar] = useState(false)
  const [totalSavings, setTotalSavings] = useState(0)
  const [monthlySP500Investment, setMonthlySP500Investment] = useState(0)
  const [totalSP500Value, setTotalSP500Value] = useState(0)
  const [hasRental, setHasRental] = useState(false)
  const [selectedRental, setSelectedRental] = useState<any>(null)
  const [monthlyRent, setMonthlyRent] = useState(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const [selectedInvestmentStrategy, setSelectedInvestmentStrategy] = useState('moderate')
  const [investmentHistory, setInvestmentHistory] = useState<Array<{year: number, return: number, strategy: string}>>([])

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlan()
    } else if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router, params.id])

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/financial-plans/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const planData = data.financialPlan
        setPlan(planData)
        
        // Initialize form and state from plan data
        setForm({
          startingSalary: planData.startingSalary,
          salaryGrowthPercent: planData.salaryGrowthPercent,
          age: planData.age,
        })
        setCurrentYear(planData.currentYear)
        setCurrentAge(planData.currentAge)
        setCurrentSalary(planData.currentSalary)
        setHousePrice(planData.housePrice)
        setHasHouse(planData.hasHouse)
        setCarPrice(planData.carPrice)
        setHasCar(planData.hasCar)
        setTotalSavings(planData.totalSavings)
        setMonthlySP500Investment(planData.monthlySP500Investment)
        setTotalSP500Value(planData.totalSP500Value)
        setHasRental(planData.hasRental)
        setSelectedRental(planData.selectedRental)
        setMonthlyRent(planData.monthlyRent)
        setSelectedInvestmentStrategy(planData.selectedInvestmentStrategy)
        
        if (planData.achievements) {
          try {
            setAchievements(JSON.parse(planData.achievements))
          } catch (e) {
            setAchievements([])
          }
        }
        
        // Convert simulation history to investment history
        const history = planData.simulationHistory.map((entry: any) => ({
          year: entry.year,
          return: entry.investmentReturn || 0,
          strategy: entry.investmentStrategy || 'moderate'
        }))
        setInvestmentHistory(history)
      }
    } catch (error) {
      console.error("Error fetching plan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePlan = async () => {
    if (!plan) return
    
    try {
      await fetch(`/api/financial-plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description,
          gameMode: plan.gameMode,
          currentYear,
          currentAge,
          currentSalary,
          totalSavings,
          housePrice,
          hasHouse,
          carPrice,
          hasCar,
          hasRental,
          selectedRental,
          monthlyRent,
          monthlySP500Investment,
          totalSP500Value,
          selectedInvestmentStrategy,
          achievements,
        }),
      })
    } catch (error) {
      console.error("Error saving plan:", error)
    }
  }

  const saveSimulationHistory = async () => {
    if (!plan) return
    
    try {
      await fetch(`/api/financial-plans/${plan.id}/simulation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: currentYear,
          age: currentAge,
          salary: currentSalary,
          totalSavings,
          totalSP500Value,
          monthlySP500Investment,
          hasHouse,
          hasCar,
          hasRental,
          monthlyRent,
          investmentReturn: investmentHistory[investmentHistory.length - 1]?.return,
          investmentStrategy: selectedInvestmentStrategy,
          achievements,
        }),
      })
    } catch (error) {
      console.error("Error saving simulation history:", error)
    }
  }

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
  ]

  const calculateActualReturn = (strategyId: string, year: number) => {
    const strategy = investmentStrategies.find(s => s.id === strategyId)
    if (!strategy) return 0.08
    
    const random = Math.random()
    const risk = strategy.risk
    const baseReturn = strategy.baseReturn
    
    if (random < risk) {
      const badReturn = baseReturn * (Math.random() * 0.5 - 0.5)
      return badReturn
    } else {
      const goodReturn = baseReturn + (Math.random() * baseReturn * 0.5)
      return goodReturn
    }
  }

  const simulateYear = async () => {
    if (currentYear === 1) {
      setCurrentAge(form.age)
      setCurrentSalary(form.startingSalary)
    } else {
      setCurrentAge(prev => prev + 1)
      setCurrentSalary(prev => prev * (1 + form.salaryGrowthPercent / 100))
      
      if (monthlySP500Investment > 0) {
        const monthlyContribution = monthlySP500Investment * 12
        const actualReturn = calculateActualReturn(selectedInvestmentStrategy, currentYear)
        
        setTotalSP500Value(prev => {
          const newValue = (prev + monthlyContribution) * (1 + actualReturn)
          return newValue
        })
        
        setInvestmentHistory(prevHistory => {
          const yearExists = prevHistory.some(entry => entry.year === currentYear)
          if (yearExists) {
            return prevHistory
          }
          return [
            ...prevHistory,
            { year: currentYear, return: actualReturn, strategy: selectedInvestmentStrategy }
          ]
        })
      }
    }
    
    setCurrentYear(prev => prev + 1)
    
    if (plan?.gameMode === 'game') {
      checkAchievements()
    }
    
    // Save simulation history
    await saveSimulationHistory()
    // Save plan state
    await savePlan()
  }

  const checkAchievements = () => {
    const newAchievements = [...achievements]
    
    if (hasHouse && !achievements.includes('homeowner')) {
      newAchievements.push('homeowner')
    }
    if (hasCar && !achievements.includes('car_owner')) {
      newAchievements.push('car_owner')
    }
    if (hasRental && !achievements.includes('renter')) {
      newAchievements.push('renter')
    }
    if (currentYear >= 5 && !achievements.includes('survivor')) {
      newAchievements.push('survivor')
    }
    
    setAchievements(newAchievements)
  }

  const handleBuyHouse = async () => {
    const downPayment = housePrice * 0.10
    if (totalSavings >= downPayment) {
      setTotalSavings(prev => prev - downPayment)
      setHasHouse(true)
      await savePlan()
    }
  }

  const handleBuyCar = async () => {
    if (totalSavings >= carPrice) {
      setTotalSavings(prev => prev - carPrice)
      setHasCar(true)
      await savePlan()
    }
  }

  const handleBuyRental = async () => {
    if (selectedRental && totalSavings >= selectedRental.price) {
      setTotalSavings(prev => prev - selectedRental.price)
      setHasRental(true)
      setMonthlyRent(selectedRental.rent)
      await savePlan()
    }
  }

  const monthlyTakeHome = currentSalary / 12 * 0.7
  const monthlyExpenses = (hasHouse ? housePrice * 0.003 : 0) + (hasCar ? carPrice * 0.01 : 0) + 2000
  const availableMonthlyIncome = monthlyTakeHome - monthlyExpenses + (hasRental ? monthlyRent : 0)

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading simulation...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${plan.gameMode === 'game' ? 'bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`text-center mb-8 ${plan.gameMode === 'game' ? 'text-purple-900' : 'text-gray-800'}`}>
          <h1 className={`text-4xl font-bold mb-4 ${plan.gameMode === 'game' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}>
            {plan.gameMode === 'game' ? '🎮 Life Simulator Finance' : 'Personal Finance Simulator'}
          </h1>
          <p className={`text-lg ${plan.gameMode === 'game' ? 'text-purple-700' : 'text-gray-600'}`}>
            {plan.name}
          </p>
          <div className="mt-4">
            <button
              onClick={() => router.push("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mr-4"
            >
              ← Back to Plans
            </button>
            <button
              onClick={savePlan}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              💾 Save Progress
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`mb-8 ${plan.gameMode === 'game' ? 'bg-white rounded-lg shadow-lg p-2' : 'bg-white rounded-lg shadow-sm p-2'}`}>
          <div className="flex flex-wrap justify-center gap-2">
            {["Simulator", "Financial Status", "Purchases", "Investments", "Optimization"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? plan.gameMode === 'game'
                      ? 'bg-purple-600 text-white shadow-md transform scale-105'
                      : 'bg-blue-600 text-white shadow-md'
                    : plan.gameMode === 'game'
                      ? 'text-purple-600 hover:bg-purple-100 hover:scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === "Simulator" && "🎮 Simulator"}
                {tab === "Financial Status" && "💰 Financial Status"}
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
              gameMode={plan.gameMode}
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
              gameMode={plan.gameMode}
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
              gameMode={plan.gameMode}
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
              gameMode={plan.gameMode}
              selectedStrategy={selectedInvestmentStrategy}
              setSelectedStrategy={setSelectedInvestmentStrategy}
              investmentHistory={investmentHistory}
            />
          )}

          {activeTab === "Optimization" && (
            <OptimizationTab
              monthlyBudget={Math.max(0, Math.floor(availableMonthlyIncome))}
              gameMode={plan.gameMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className={`text-center text-sm ${plan.gameMode === 'game' ? 'text-purple-600' : 'text-gray-500'}`}>
          <p>
            {plan.gameMode === 'game' 
              ? '🎮 Ready to build your financial empire? Make smart choices and watch your wealth grow!' 
              : '📊 Plan wisely, invest consistently, and secure your financial future.'}
          </p>
        </div>
      </div>
    </div>
  )
}
