"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import type { Transaction, ApiResponse } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { UserTabs } from "@/components/user-tabs"

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

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId)
  }

  const getUserInfo = () => {
    return {
      name: selectedUser === "ray" ? "Ray" : "Bon",
      avatar: selectedUser === "Bon" ? "/bad_boy.jpg" : "/cute_girl.png",
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

      <div className="flex flex-wrap gap-4 justify-center">
        <Card className="flex-1 min-w-[80px] max-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คงเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{balance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[80px] max-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-500">{totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[80px] max-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายจ่าย</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-500">{totalExpenses.toFixed(2)}</div>
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
        <TabsContent value="add">
          <TransactionForm
            onSubmit={addTransaction}
            userName={userInfo.name}
            userFallback={userInfo.fallback}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

