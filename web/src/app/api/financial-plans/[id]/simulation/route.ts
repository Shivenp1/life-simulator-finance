import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Save simulation history entry
    const simulationEntry = await prisma.simulationHistory.create({
      data: {
        financialPlanId: params.id,
        year: data.year,
        age: data.age,
        salary: data.salary,
        totalSavings: data.totalSavings,
        totalSP500Value: data.totalSP500Value,
        monthlySP500Investment: data.monthlySP500Investment,
        hasHouse: data.hasHouse,
        hasCar: data.hasCar,
        hasRental: data.hasRental,
        monthlyRent: data.monthlyRent,
        investmentReturn: data.investmentReturn,
        investmentStrategy: data.investmentStrategy,
        achievements: data.achievements ? JSON.stringify(data.achievements) : null,
      }
    })

    return NextResponse.json({ simulationEntry }, { status: 201 })
  } catch (error) {
    console.error("Error saving simulation history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
