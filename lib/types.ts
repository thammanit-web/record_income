export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  date: string
  user_id?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

