import { supabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET all transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id") || "anonymous"

    const { data, error } = await supabaseServer
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// POST a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseServer
      .from("transactions")
      .insert([
        {
          description: body.description,
          amount: body.amount,
          category: body.category,
          type: body.type,
          date: body.date || new Date().toISOString(),
          user_id: body.user_id || "anonymous", // Now we'll get this from the request
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

