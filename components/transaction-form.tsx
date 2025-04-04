"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => Promise<boolean>
  userName: string
  userFallback: string
}

export default function TransactionForm({ onSubmit, userName, userFallback }: TransactionFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("ทั่วไป")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])  // Default to today's date
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const userAvatar = userName === "Bon" ? "/bad_boy.jpg" : "/cute_girl.png" 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) return

    setIsSubmitting(true)

    const transaction: Transaction = {
      id: "",
      description,
      amount: Number.parseFloat(amount),
      category,
      type,
      date, // Use the selected date
    }

    const success = await onSubmit(transaction)

    setIsSubmitting(false)

    if (success) {
      // Reset form
      setDescription("")
      setAmount("")
      setCategory("ทั่วไป")
      setDate(new Date().toISOString().split('T')[0])  // Reset to today's date

      toast({
        title: "เพิ่มธุรกรรมสำเร็จ",
        description: `ธุรกรรมของ ${userName} ถูกบันทึกเรียบร้อยแล้ว`,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>เพิ่มรายรับรายจ่าย</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
            <span>{userName}</span>
          </Badge>
        </div>
        <CardDescription>บันทึกรายรับรายจ่ายสำหรับ {userName}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">ประเภทธุรกรรม</Label>
            <RadioGroup
              id="type"
              value={type}
              onValueChange={(value) => setType(value as "income" | "expense")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-emerald-500 font-medium">
                  รายรับ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-rose-500 font-medium">
                  รายจ่าย
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">วันที่</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดต่างๆ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">จำนวนเงิน</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">หมวดหมู่</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ทั่วไป">ทั่วไป</SelectItem>
                <SelectItem value="อาหาร">อาหาร</SelectItem>
                <SelectItem value="ค่าเดินทาง">ค่าเดินทาง</SelectItem>
                <SelectItem value="ค่าหอ">ค่าหอ</SelectItem>
                <SelectItem value="ค่าเครื่องใช้">ค่าเครื่องใช้</SelectItem>
                <SelectItem value="ค่ารักษา">ค่ารักษา</SelectItem>
                <SelectItem value="เงินเดือน">เงินเดือน</SelectItem>
                <SelectItem value="ค่าเครื่องสำอาง">ค่าเครื่องสำอาง</SelectItem>
                <SelectItem value="ของขวัญ">ของขวัญ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "เพิ่มธุรกรรม"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}