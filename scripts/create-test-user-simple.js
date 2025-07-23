const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  try {
    console.log('Creating test user account...')
    
    // Create user using regular signup
    const { data, error } = await supabase.auth.signUp({
      email: 'test@dutchtax.nl',
      password: 'test123456',
      options: {
        data: {
          name: 'Test User',
          role: 'test'
        }
      }
    })

    if (error) {
      console.error('Error creating user:', error)
      return
    }

    if (data.user) {
      console.log('✅ Test user created successfully!')
      console.log('Email: test@dutchtax.nl')
      console.log('Password: test123456')
      console.log('User ID:', data.user.id)
      
      if (data.session) {
        console.log('✅ User is automatically signed in!')
        console.log('Session token:', data.session.access_token.substring(0, 20) + '...')
      } else {
        console.log('⚠️  User created but needs email confirmation')
        console.log('Check your email or use the Supabase dashboard to confirm the user')
      }
    }

    console.log('\n🎉 Test account setup complete!')
    console.log('\nYou can now login with:')
    console.log('Email: test@dutchtax.nl')
    console.log('Password: test123456')

  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUser() 