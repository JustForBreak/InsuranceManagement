'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
                <div className="space-y-3">
                  <div>
                    <FieldLabel htmlFor="role" className="text-base font-semibold text-foreground mb-2 block">
                      Account Type
                    </FieldLabel>
                    <FieldDescription className="text-sm mb-3">
                      Choose customer for personal insurance or agent for managing policies
                    </FieldDescription>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-lg border-2 border-primary/20 -z-10" />
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => setFormData({...formData, role: value})}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id="role" 
                        className="h-14 text-base font-medium bg-background/80 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50 focus:border-primary shadow-sm"
                      >
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="customer" className="text-base font-medium py-3">
                          Customer
                        </SelectItem>
                        <SelectItem value="agent" className="text-base font-medium py-3">
                          Agent
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
          
          <div className="bg-muted relative hidden md:block overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=1200&fit=crop&q=80" 
                alt="Team collaboration" 
                fill
                className="object-cover opacity-20"
                unoptimized
              />
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
            
            <div className="relative z-10 flex flex-col items-center justify-center p-8 h-full min-h-[500px]">
              {/* Main image */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 relative w-full max-w-sm h-64">
                <Image 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80" 
                  alt="Insurance benefits" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              
              <div className="text-center space-y-4 max-w-md">
                <h2 className="text-2xl font-bold">Join Our Platform</h2>
                <p className="text-muted-foreground">
                  Manage your insurance policies with ease and confidence
                </p>
                <div className="space-y-3 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Secure policy management</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Easy claim submissions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>24/7 access to your data</span>
                  </div>
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

