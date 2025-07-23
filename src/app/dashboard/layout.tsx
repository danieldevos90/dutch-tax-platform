'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#60A5FA] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <span className="text-2xl font-bold text-white">₹</span>
          </div>
          <div className="text-white font-semibold text-lg mb-2">Dutch Tax Platform</div>
          <div className="text-gray-400 text-sm mb-6">Loading your dashboard...</div>
          <div className="w-8 h-8 border-2 border-[#60A5FA]/30 border-t-[#60A5FA] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to home page
  }

  return <DashboardLayout>{children}</DashboardLayout>
} 