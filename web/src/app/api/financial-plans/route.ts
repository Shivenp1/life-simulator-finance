import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const financialPlans = await prisma.financialPlan.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    return NextResponse.json({ financialPlans })
  } catch (error) {
    console.error("Error fetching financial plans:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const financialPlan = await prisma.financialPlan.create({
      data: {
        userId: session.user.id,
        name: data.name,
        description: data.description,
        gameMode: data.gameMode || "serious",
        startingSalary: data.startingSalary,
        salaryGrowthPercent: data.salaryGrowthPercent,
        age: data.age,
        currentAge: data.age,
        currentSalary: data.startingSalary,
        housePrice: data.housePrice || 0,
        carPrice: data.carPrice || 0,
        monthlySP500Investment: data.monthlySP500Investment || 0,
        selectedInvestmentStrategy: data.selectedInvestmentStrategy || "moderate",
      }
    })

    return NextResponse.json({ financialPlan }, { status: 201 })
  } catch (error) {
    console.error("Error creating financial plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
