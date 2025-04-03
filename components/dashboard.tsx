"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon } from "lucide-react"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import type { Transaction, ApiResponse } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { UserTabs } from "@/components/user-tabs"
import { isSameDay, isSameMonth, startOfMonth, endOfMonth, format } from "date-fns"
import { th } from "date-fns/locale"

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>("ray")

  const fetchTransactions = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/transactions?user_id=${userId}`)
      const result: ApiResponse<Transaction[]> = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setTransactions(result.data || [])
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
      setError("Failed to load transactions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(selectedUser)
  }, [selectedUser])

  const addTransaction = async (transaction: Transaction) => {
    try {
      setError(null)

      const transactionWithUser = {
        ...transaction,
        user_id: selectedUser,
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionWithUser),
      })

      const result: ApiResponse<Transaction> = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.data) {
        setTransactions([result.data, ...transactions])
      }

      return true
    } catch (err) {
      console.error("Failed to add transaction:", err)
      setError("Failed to add transaction. Please try again.")
      return false
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      setError(null)

      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setTransactions(transactions.filter((transaction) => transaction.id !== id))
      return true
    } catch (err) {
      console.error("Failed to delete transaction:", err)
      setError("Failed to delete transaction. Please try again.")
      return false
    }
  }

  // Get current date
  const today = new Date()
  const currentMonth = startOfMonth(today)
  const currentMonthEnd = endOfMonth(today)
  const [selectedMonth, setSelectedMonth] = useState<string>(format(today, "yyyy-MM"))

  // Format current month for display
  const formattedCurrentMonth = format(today, "MMMM yyyy", { locale: th })
  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value)
  }

  const formattedSelectedMonth = format(new Date(selectedMonth), "MMMM yyyy", { locale: th })

  // Calculate monthly totals (only transactions from current month)
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return isSameMonth(transactionDate, new Date(selectedMonth))
    })
  }, [transactions, today])

  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

  const monthlyExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

  const monthlyBalance = monthlyIncome - monthlyExpenses

  // Calculate today's expenses
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return isSameDay(transactionDate, today)
    })
  }, [transactions, today])

  const todayExpenses = todayTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

  const todayIncome = todayTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId)
  }

  const getUserInfo = () => {
    return {
      name: selectedUser === "ray" ? "Ray" : "Bon",
      avatar: selectedUser === "ray" ?  "/cute_girl.png":"/bad_boy.jpg",
      fallback: selectedUser === "ray" ? "R" : "B",
    }
  }

  const userInfo = getUserInfo()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <UserTabs selectedUser={selectedUser} onUserChange={handleUserChange} />

      <div className="flex flex-col items-center gap-2">
      <input
          type="month"
          value={format(selectedMonth, "yyyy-MM")}
          onChange={handleMonthChange}
          className="p-1 border rounded-md text-[8px]"
        />
    
      <div className="flex gap-2 justify-center">
        <Card className="flex-1 min-w-[105px] max-w-[300px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-medium">คงเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[14px] font-bold">{monthlyBalance.toFixed(2)}</div>
            <p className="text-[8px] text-muted-foreground mt-1">
              {formattedCurrentMonth}
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[105px] max-w-[300px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-medium">รายได้</CardTitle>
            <ArrowUpIcon className="h-2 w-2 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-[14px]  font-bold text-emerald-500">{monthlyIncome.toFixed(2)}</div>
            <div className="flex justify-between items-center mt-1">

              <p className="text-[10px] text-emerald-500">วันนี้: {todayIncome.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[105px] max-w-[300px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-medium">รายจ่าย</CardTitle>
            <ArrowDownIcon className="h-2 w-2 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-[14px] font-bold text-rose-500">{monthlyExpenses.toFixed(2)}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] text-rose-500">วันนี้: {todayExpenses.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">ประวัติ</TabsTrigger>
          <TabsTrigger value="add">เพิ่ม</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
            userName={userInfo.name}
            userAvatar={userInfo.avatar}
            userFallback={userInfo.fallback}
          />
        </TabsContent>
        <TabsContent value="add" className="space-y-4">
          <TransactionForm
            onSubmit={addTransaction}
            userName={userInfo.name}
       
            userFallback={userInfo.fallback}
          />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  )
}

