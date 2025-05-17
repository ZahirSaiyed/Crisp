'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const roles = [
  "Product Manager",
  "Startup Founder",
  "Team Leader",
  "Engineer / Builder",
  "Creator / Coach",
  "Other"
]

export function WaitlistForm() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    challenge: '',
    botField: ''
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!form.email || !validateEmail(form.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    if (form.name.length > 100) {
      toast.error('Name must be less than 100 characters')
      return
    }
    
    if (form.challenge.length > 500) {
      toast.error('Challenge description must be less than 500 characters')
      return
    }

    if (form.botField) {
      toast.error('Invalid submission')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success("You're on the list! 🎉")
        setForm({ name: '', email: '', role: '', challenge: '', botField: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Something went wrong.')
      }
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto text-base md:text-lg">
      <input
        type="text"
        name="bot-field"
        className="hidden"
        value={form.botField}
        onChange={(e) => setForm({ ...form, botField: e.target.value })}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          maxLength={100}
          className="h-14 text-lg px-5"
        />
        <Input
          placeholder="Email"
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="h-14 text-lg px-5"
        />
      </div>
      <Select
        value={form.role}
        onValueChange={(value) => setForm({ ...form, role: value })}
      >
        <SelectTrigger className="h-14 text-lg px-5">
          <SelectValue placeholder="I'm a..." />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role} className="text-lg py-3">
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="What's your biggest communication challenge?"
        value={form.challenge}
        onChange={(e) => setForm({ ...form, challenge: e.target.value })}
        maxLength={500}
        className="min-h-[120px] text-lg px-5 py-4"
      />
      <Button type="submit" disabled={loading} className="w-full h-14 text-lg">
        {loading ? 'Joining...' : 'Join Private Beta'}
      </Button>
    </form>
  )
} 