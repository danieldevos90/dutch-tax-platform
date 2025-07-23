const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  try {
    console.log('Testing login with test account...')
    
    // Try to sign in with the test account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@dutchtax.nl',
      password: 'test123456'
    })

    if (error) {
      console.error('Login error:', error.message)
      
      if (error.message.includes('Email not confirmed')) {
        console.log('\n📧 The user needs email confirmation.')
        console.log('You can either:')
        console.log('1. Check the email inbox for test@dutchtax.nl')
        console.log('2. Use the Supabase dashboard to confirm the user')
        console.log('3. Try creating a new account through the web interface')
      }
      return
    }

    if (data.user) {
      console.log('✅ Login successful!')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
      console.log('Session created:', !!data.session)
      
      if (data.session) {
        console.log('✅ User is now authenticated!')
        console.log('You can now use the application with this account.')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

testLogin() 