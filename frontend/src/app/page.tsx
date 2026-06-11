"use client"
import Login from "@/components/layout/login"
import MainDashboard from "./dashboard/page"


export default function Home() {

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center">
      <MainDashboard/>
      
    </main>
  )
}