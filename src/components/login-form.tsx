'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      setError('Connection failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Insurance Management account
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>
              
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium underline underline-offset-4">
                  Sign up
                </Link>
              </FieldDescription>

              <FieldDescription className="text-center text-xs">
                <strong>Test Credentials:</strong><br/>
                Admin: admin@example.com / password123<br/>
                Agent: agent@example.com / password123<br/>
                Customer: customer@example.com / password123
              </FieldDescription>
            </FieldGroup>
          </form>
          
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">🛡️</div>
                <h2 className="text-2xl font-bold">Insurance Management</h2>
                <p className="text-muted-foreground">
                  Secure and efficient insurance policy management system
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{' '}
        <a href="#" className="underline underline-offset-4">Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="underline underline-offset-4">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
