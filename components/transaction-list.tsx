"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, SearchIcon, Trash2Icon, Loader2, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => Promise<boolean>
  userName: string
  userAvatar: string
  userFallback: string
}

// Helper function to format month
const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  })
}

// Helper function to get month key (for grouping)
const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

export default function TransactionList({
  transactions,
  onDelete,
  userName,

  userFallback,
}: TransactionListProps) {
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const isMobile = useMobile()
  const { toast } = useToast()
  const userAvatar = userName === "Bon" ? "/bad_boy.jpg" : "/cute_girl.png" 


  // Get unique months from transactions
  const availableMonths = useMemo(() => {
    const months = new Map<string, { key: string; label: string; date: Date }>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const key = getMonthKey(date)

      if (!months.has(key)) {
        months.set(key, {
          key,
          label: formatMonthYear(date),
          date,
        })
      }
    })

    // Sort months in descending order (newest first)
    return Array.from(months.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [transactions])

  // Filter transactions by search term and selected month
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Filter by search term
        const matchesSearch =
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())

        // Filter by month if a specific month is selected
        const matchesMonth =
          selectedMonth === "all" ||
          (() => {
            const date = new Date(t.date)
            return getMonthKey(date) === selectedMonth
          })()

        return matchesSearch && matchesMonth
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, search, selectedMonth])

  // Group transactions by month
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; transactions: Transaction[] }>()

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const key = getMonthKey(date)

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: formatMonthYear(date),
          transactions: [],
        })
      }

      groups.get(key)?.transactions.push(transaction)
    })

    // Sort groups by date (newest first)
    return Array.from(groups.values()).sort((a, b) => {
      const dateA = new Date(a.transactions[0].date)
      const dateB = new Date(b.transactions[0].date)
      return dateB.getTime() - dateA.getTime()
    })
  }, [filteredTransactions])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
      year: isMobile ? undefined : "numeric",
    })
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const success = await onDelete(id)

    if (success) {
      toast({
        title: "ลบธุรกรรมสำเร็จ",
        description: "ธุรกรรมถูกลบออกจากระบบเรียบร้อยแล้ว",
      })
    }

    setDeletingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ประวัติธุรกรรม</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
            <span>{userName}</span>
          </Badge>
        </div>
        <CardDescription>ธุรกรรมทั้งหมดของ {userName}</CardDescription>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหารายรับรายจ่าย..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[180px]">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <SelectValue placeholder="เลือกเดือน" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกเดือน</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month.key} value={month.key}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {transactions.length === 0 ? `ยังไม่มีธุรกรรมสำหรับ ${userName} กรุณาเพิ่มธุรกรรมใหม่` : "ไม่พบธุรกรรมที่ตรงกับการค้นหา"}
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {groupedTransactions.map((group) => (
                <div key={group.key} className="space-y-4">
                  <div className="sticky top-0 z-10 bg-card pt-2 pb-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-muted-foreground">{group.label}</h3>
                      <Separator className="flex-1 ml-2" />
                    </div>
                  </div>

                  {group.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${transaction.type === "income" ? "bg-emerald-100" : "bg-rose-100"}`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || "ไม่มีคำอธิบาย"}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {transaction.amount.toFixed(2)}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2Icon className="h-4 w-4" />
                              <span className="sr-only">ลบ</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                              <AlertDialogDescription>
                                การกระทำนี้ไม่สามารถยกเลิกได้ ธุรกรรมนี้จะถูกลบออกจากระบบอย่างถาวร
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                                disabled={deletingId === transaction.id}
                              >
                                {deletingId === transaction.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังลบ...
                                  </>
                                ) : (
                                  "ลบ"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

