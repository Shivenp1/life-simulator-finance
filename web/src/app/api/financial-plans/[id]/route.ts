import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const financialPlan = await prisma.financialPlan.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        simulationHistory: {
          orderBy: {
            year: "asc"
          }
        }
      }
    })

    if (!financialPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({ financialPlan })
  } catch (error) {
    console.error("Error fetching financial plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const financialPlan = await prisma.financialPlan.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        name: data.name,
        description: data.description,
        gameMode: data.gameMode,
        currentYear: data.currentYear,
        currentAge: data.currentAge,
        currentSalary: data.currentSalary,
        totalSavings: data.totalSavings,
        housePrice: data.housePrice,
        hasHouse: data.hasHouse,
        carPrice: data.carPrice,
        hasCar: data.hasCar,
        hasRental: data.hasRental,
        selectedRental: data.selectedRental,
        monthlyRent: data.monthlyRent,
        monthlySP500Investment: data.monthlySP500Investment,
        totalSP500Value: data.totalSP500Value,
        selectedInvestmentStrategy: data.selectedInvestmentStrategy,
        achievements: data.achievements ? JSON.stringify(data.achievements) : null,
      }
    })

    if (financialPlan.count === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating financial plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await prisma.financialPlan.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting financial plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
