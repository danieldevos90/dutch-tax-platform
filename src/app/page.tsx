'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import LoginForm from '@/components/auth/LoginForm'

function AppContent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <div className="text-black font-semibold text-lg mb-2">DutchTax</div>
          <div className="text-gray-500 text-sm mb-6">Loading your dashboard...</div>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg">
          <span className="text-2xl font-bold text-white">T</span>
        </div>
        <div className="text-black font-semibold text-lg mb-2">Redirecting to Dashboard...</div>
        <div className="text-gray-500 text-sm">Please wait...</div>
      </div>
    </div>
  )
}

export default function Home() {
  return <AppContent />
}
