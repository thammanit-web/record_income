"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, SearchIcon, Trash2Icon, Loader2, CalendarIcon, XCircleIcon } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay } from "date-fns"
import { th } from "date-fns/locale"

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
  userAvatar,
  userFallback,
}: TransactionListProps) {
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())  
  const isMobile = useMobile()
  const { toast } = useToast()

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

  // Filter transactions by search term, selected month, and selected day
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

        // Filter by day if a specific day is selected
        const matchesDay =
          !selectedDate ||
          (() => {
            const date = new Date(t.date)
            return isSameDay(date, selectedDate)
          })()

        return matchesSearch && matchesMonth && matchesDay
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, search, selectedMonth, selectedDate])

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

  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth("all")
    setSelectedDate(null)
    setSearch("")
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)

      // Also set the month filter to match the selected date
      const monthKey = getMonthKey(date)
      setSelectedMonth(monthKey)
    }
  }

  // Handle month selection
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month)

    // If a day was selected and the month changes, clear the day selection
    if (selectedDate && month !== "all") {
      const selectedDateMonth = getMonthKey(selectedDate)
      if (selectedDateMonth !== month) {
        setSelectedDate(null)
      }
    }
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

          <div className="flex gap-2">
            <div className="w-full sm:w-[180px]">
              <Select value={selectedMonth} onValueChange={handleMonthSelect}>
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant={selectedDate ? "default" : "outline"} className="w-full sm:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: th }) : "เลือกวัน"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={selectedDate || undefined} onSelect={handleDateSelect} initialFocus />
              </PopoverContent>
            </Popover>

            {(selectedMonth !== "all" || selectedDate || search) && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="ล้างตัวกรอง">
                <XCircleIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {(selectedMonth !== "all" || selectedDate || search) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedMonth !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>เดือน: {availableMonths.find((m) => m.key === selectedMonth)?.label}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => setSelectedMonth("all")}
                >
                  <XCircleIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>วัน: {format(selectedDate, "dd MMM yyyy", { locale: th })}</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSelectedDate(null)}>
                  <XCircleIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>ค้นหา: {search}</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSearch("")}>
                  <XCircleIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
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