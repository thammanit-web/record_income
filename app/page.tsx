import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 md:text-3xl">บันทึกรายรับรายจ่าย</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}

