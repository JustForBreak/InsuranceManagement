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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'customer'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to login page
        router.push('/')
      } else {
        setError(data.message || 'Registration failed')
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
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-balance">
                  Sign up for an Insurance Management account
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Account Type</FieldLabel>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Choose customer for personal insurance or agent for managing policies
                </FieldDescription>
              </Field>
              
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link href="/" className="font-medium underline underline-offset-4">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">📋</div>
                <h2 className="text-2xl font-bold">Join Our Platform</h2>
                <p className="text-muted-foreground">
                  Manage your insurance policies with ease and confidence
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Secure policy management</p>
                  <p>✓ Easy claim submissions</p>
                  <p>✓ 24/7 access to your data</p>
                </div>
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

