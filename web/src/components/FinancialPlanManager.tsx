"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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
  createdAt: string
  updatedAt: string
}

export function FinancialPlanManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<FinancialPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    gameMode: "serious",
    startingSalary: 50000,
    salaryGrowthPercent: 3,
    age: 25,
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlans()
    } else if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/financial-plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data.financialPlans)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/financial-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlan),
      })

      if (response.ok) {
        const data = await response.json()
        setPlans([data.financialPlan, ...plans])
        setShowCreateForm(false)
        setNewPlan({
          name: "",
          description: "",
          gameMode: "serious",
          startingSalary: 50000,
          salaryGrowthPercent: 3,
          age: 25,
        })
      }
    } catch (error) {
      console.error("Error creating plan:", error)
    }
  }

  const deletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return

    try {
      const response = await fetch(`/api/financial-plans/${planId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== planId))
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
    }
  }

  const loadPlan = (planId: string) => {
    router.push(`/simulator/${planId}`)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Financial Plans
          </h1>
          <p className="text-gray-600">
            Manage and track your financial simulations
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Create New Plan
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Financial Plan</h2>
            <form onSubmit={createPlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="My Financial Plan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Mode
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPlan.gameMode}
                    onChange={(e) => setNewPlan({ ...newPlan, gameMode: e.target.value })}
                  >
                    <option value="serious">Serious Mode</option>
                    <option value="game">Game Mode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Salary ($)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPlan.startingSalary}
                    onChange={(e) => setNewPlan({ ...newPlan, startingSalary: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Growth (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPlan.salaryGrowthPercent}
                    onChange={(e) => setNewPlan({ ...newPlan, salaryGrowthPercent: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Age
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPlan.age}
                    onChange={(e) => setNewPlan({ ...newPlan, age: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Describe your financial goals..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadPlan(plan.id)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {plan.description && (
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    plan.gameMode === 'game' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.gameMode === 'game' ? '🎮 Game' : '📊 Serious'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Starting Salary:</span>
                  <span className="font-medium">${plan.startingSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Year:</span>
                  <span className="font-medium">{plan.currentYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Savings:</span>
                  <span className="font-medium">${plan.totalSavings.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  Updated: {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No financial plans yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first financial plan to start simulating your future
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Your First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
