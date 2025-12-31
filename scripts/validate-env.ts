/**
 * Environment Variable Validation Script
 * Run with: npx ts-node scripts/validate-env.ts
 * Or during build: Add to package.json "prebuild" script
 */

interface EnvVar {
  name: string
  required: boolean
  public: boolean
  description: string
  pattern?: RegExp
  example?: string
}

const envVars: EnvVar[] = [
  // Supabase - Required
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    public: true,
    description: 'Supabase project URL',
    pattern: /^https:\/\/.+\.supabase\.co$/,
    example: 'https://xxxxx.supabase.co',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    public: true,
    description: 'Supabase anonymous key (safe for client)',
    pattern: /^eyJ.+/,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    public: false,
    description: 'Supabase service role key (server-side only)',
    pattern: /^eyJ.+/,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },

  // Application - Required
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    public: true,
    description: 'Application URL',
    pattern: /^https?:\/\/.+/,
    example: 'https://gantt-dashboard.vercel.app',
  },

  // Application - Optional
  {
    name: 'NEXT_PUBLIC_APP_NAME',
    required: false,
    public: true,
    description: 'Application display name',
    example: 'Gantt Dashboard',
  },
  {
    name: 'NEXT_PUBLIC_ENV',
    required: false,
    public: true,
    description: 'Environment identifier',
    pattern: /^(development|preview|production)$/,
    example: 'production',
  },

  // Monitoring - Optional
  {
    name: 'SENTRY_DSN',
    required: false,
    public: false,
    description: 'Sentry error tracking DSN',
    pattern: /^https:\/\/.+@.+\.ingest\.sentry\.io\/.+/,
    example: 'https://xxx@xxx.ingest.sentry.io/xxx',
  },
]

function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  console.log('\n🔍 Validating environment variables...\n')

  for (const envVar of envVars) {
    const value = process.env[envVar.name]
    const exists = value !== undefined && value !== ''

    if (envVar.required && !exists) {
      errors.push(`❌ Missing required: ${envVar.name}`)
      console.log(`   Description: ${envVar.description}`)
      if (envVar.example) {
        console.log(`   Example: ${envVar.example}`)
      }
      continue
    }

    if (!exists) {
      // Optional and not set - just note it
      console.log(`⚪ Optional not set: ${envVar.name}`)
      continue
    }

    // Validate pattern if provided
    if (envVar.pattern && !envVar.pattern.test(value)) {
      errors.push(`❌ Invalid format: ${envVar.name}`)
      console.log(`   Expected pattern: ${envVar.pattern}`)
      console.log(`   Got: ${value.substring(0, 20)}...`)
      continue
    }

    // Check for accidental exposure of private keys
    if (!envVar.public && envVar.name.startsWith('NEXT_PUBLIC_')) {
      warnings.push(`⚠️  Private key exposed publicly: ${envVar.name}`)
    }

    console.log(`✅ Valid: ${envVar.name}`)
  }

  // Check for common mistakes
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('NEXT_PUBLIC_')) {
    errors.push('❌ Service role key should not be prefixed with NEXT_PUBLIC_')
  }

  // Summary
  console.log('\n' + '='.repeat(50))

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are valid!\n')
    return { valid: true, errors: [], warnings: [] }
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach((w) => console.log(`   ${w}`))
  }

  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach((e) => console.log(`   ${e}`))
    console.log('\n')
    return { valid: false, errors, warnings }
  }

  return { valid: true, errors: [], warnings }
}

// Run validation
const result = validateEnv()

if (!result.valid) {
  console.error('Environment validation failed!')
  process.exit(1)
}

export { validateEnv, envVars }
