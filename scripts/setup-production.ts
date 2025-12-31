#!/usr/bin/env npx ts-node
/**
 * Production Setup Script
 *
 * Validates environment and prepares for production deployment.
 * Run: npx ts-node scripts/setup-production.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// =============================================================================
// Types
// =============================================================================

interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
}

// =============================================================================
// Colors for terminal output
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

// =============================================================================
// Helper Functions
// =============================================================================

function log(message: string, color?: keyof typeof colors): void {
  const prefix = color ? colors[color] : ''
  const suffix = color ? colors.reset : ''
  console.log(`${prefix}${message}${suffix}`)
}

function logCheck(result: CheckResult): void {
  const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '!' : '✗'
  const color = result.status === 'pass' ? 'green' : result.status === 'warn' ? 'yellow' : 'red'
  log(`  ${icon} ${result.name}: ${result.message}`, color)
}

// =============================================================================
// Environment Checks
// =============================================================================

function checkEnvVariable(name: string, required: boolean = true): CheckResult {
  const value = process.env[name]

  if (!value) {
    return {
      name,
      status: required ? 'fail' : 'warn',
      message: required ? 'Niet ingesteld (vereist)' : 'Niet ingesteld (optioneel)',
    }
  }

  if (value.includes('your-') || value.includes('xxx')) {
    return {
      name,
      status: 'fail',
      message: 'Bevat placeholder waarde',
    }
  }

  return {
    name,
    status: 'pass',
    message: 'Geconfigureerd',
  }
}

function checkSupabaseEnv(): CheckResult[] {
  return [
    checkEnvVariable('NEXT_PUBLIC_SUPABASE_URL'),
    checkEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    checkEnvVariable('SUPABASE_SERVICE_ROLE_KEY'),
  ]
}

function checkAppEnv(): CheckResult[] {
  return [
    checkEnvVariable('NEXT_PUBLIC_APP_URL'),
    checkEnvVariable('NEXT_PUBLIC_APP_NAME', false),
    checkEnvVariable('NEXT_PUBLIC_ENV', false),
  ]
}

// Bryntum check removed - using open-source alternatives

// =============================================================================
// File Checks
// =============================================================================

function checkFileExists(filePath: string, name: string): CheckResult {
  const fullPath = path.join(process.cwd(), filePath)

  if (fs.existsSync(fullPath)) {
    return {
      name,
      status: 'pass',
      message: `Bestaat (${filePath})`,
    }
  }

  return {
    name,
    status: 'fail',
    message: `Ontbreekt (${filePath})`,
  }
}

function checkRequiredFiles(): CheckResult[] {
  return [
    checkFileExists('package.json', 'Package.json'),
    checkFileExists('tsconfig.json', 'TypeScript Config'),
    checkFileExists('next.config.js', 'Next.js Config'),
    checkFileExists('vercel.json', 'Vercel Config'),
    checkFileExists('.env.local', 'Environment File'),
    checkFileExists('supabase/config.toml', 'Supabase Config'),
  ]
}

// =============================================================================
// Dependency Checks
// =============================================================================

function checkDependencies(): CheckResult[] {
  const results: CheckResult[] = []

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    )

    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@supabase/ssr',
    ]

    for (const dep of requiredDeps) {
      const version =
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]

      results.push({
        name: dep,
        status: version ? 'pass' : 'fail',
        message: version ? `v${version}` : 'Niet geïnstalleerd',
      })
    }

    // Bryntum check removed - using open-source alternatives
  } catch {
    results.push({
      name: 'package.json',
      status: 'fail',
      message: 'Kon niet lezen',
    })
  }

  return results
}

// =============================================================================
// Build Check
// =============================================================================

function checkBuildOutput(): CheckResult {
  const buildPath = path.join(process.cwd(), '.next')

  if (fs.existsSync(buildPath)) {
    return {
      name: 'Build Output',
      status: 'pass',
      message: '.next directory bestaat',
    }
  }

  return {
    name: 'Build Output',
    status: 'warn',
    message: 'Nog niet gebouwd (npm run build)',
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  log('\n===========================================', 'cyan')
  log(' Gantt Dashboard - Production Setup Check', 'bold')
  log('===========================================\n', 'cyan')

  // Load .env.local if exists
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      for (const line of envContent.split('\n')) {
        const [key, ...valueParts] = line.split('=')
        if (key && !key.startsWith('#')) {
          process.env[key.trim()] = valueParts.join('=').trim()
        }
      }
    }
  } catch {
    // Ignore errors
  }

  let hasErrors = false
  let hasWarnings = false

  // Check Supabase
  log('📦 Supabase Configuratie:', 'bold')
  for (const result of checkSupabaseEnv()) {
    logCheck(result)
    if (result.status === 'fail') hasErrors = true
    if (result.status === 'warn') hasWarnings = true
  }

  // Check App
  log('\n📱 Applicatie Configuratie:', 'bold')
  for (const result of checkAppEnv()) {
    logCheck(result)
    if (result.status === 'fail') hasErrors = true
    if (result.status === 'warn') hasWarnings = true
  }

  // Bryntum check removed - using open-source alternatives

  // Check Files
  log('\n📁 Vereiste Bestanden:', 'bold')
  for (const result of checkRequiredFiles()) {
    logCheck(result)
    if (result.status === 'fail') hasErrors = true
    if (result.status === 'warn') hasWarnings = true
  }

  // Check Dependencies
  log('\n📚 Dependencies:', 'bold')
  for (const result of checkDependencies()) {
    logCheck(result)
    if (result.status === 'fail') hasErrors = true
    if (result.status === 'warn') hasWarnings = true
  }

  // Check Build
  log('\n🔨 Build Status:', 'bold')
  const buildResult = checkBuildOutput()
  logCheck(buildResult)
  if (buildResult.status === 'fail') hasErrors = true
  if (buildResult.status === 'warn') hasWarnings = true

  // Summary
  log('\n===========================================', 'cyan')
  if (hasErrors) {
    log('❌ Setup NIET klaar voor productie', 'red')
    log('   Los bovenstaande fouten op', 'red')
    process.exit(1)
  } else if (hasWarnings) {
    log('⚠️  Setup grotendeels klaar', 'yellow')
    log('   Controleer de waarschuwingen', 'yellow')
    process.exit(0)
  } else {
    log('✅ Setup KLAAR voor productie!', 'green')
    process.exit(0)
  }
}

main().catch(console.error)
