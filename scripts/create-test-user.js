const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUser() {
  try {
    console.log('Creating test user account...')
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@dutchtax.nl',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'test'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('✅ Test user created successfully!')
    console.log('Email: test@dutchtax.nl')
    console.log('Password: test123456')
    console.log('User ID:', authData.user.id)

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: 'test@dutchtax.nl',
        company_name: 'Test Company',
        kvk_number: '12345678',
        btw_number: 'NL123456789B01',
        address: 'Test Street 123, 1234 AB Amsterdam',
        phone: '+31612345678',
        first_year_business: 2024,
        kor_opted_in: true
      })

    if (profileError) {
      console.log('⚠️  User profile creation failed (table might not exist yet):', profileError.message)
    } else {
      console.log('✅ User profile created successfully!')
    }

    // Add some sample transactions
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: authData.user.id,
          amount: 2500,
          currency: 'EUR',
          description: 'Freelance Project - Web Development',
          category: 'Services',
          date: '2025-01-15',
          is_deductible: false,
          deductible_percentage: 0,
          vat_amount: 525,
          vat_reclaimable: false,
          is_kia_eligible: false
        },
        {
          user_id: authData.user.id,
          amount: -85,
          currency: 'EUR',
          description: 'Office Supplies',
          category: 'Office',
          date: '2025-01-14',
          is_deductible: true,
          deductible_percentage: 100,
          vat_amount: -17.85,
          vat_reclaimable: true,
          is_kia_eligible: false
        }
      ])

    if (transactionError) {
      console.log('⚠️  Sample transactions creation failed (table might not exist yet):', transactionError.message)
    } else {
      console.log('✅ Sample transactions created successfully!')
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