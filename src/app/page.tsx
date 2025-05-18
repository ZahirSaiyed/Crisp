import * as React from 'react'
import { HowItWorks } from '@/components/how-it-works'
import { WhyItMatters } from '@/components/why-it-matters'
import { Footer } from '@/components/footer'
import { WaitlistForm } from '@/components/WaitlistForm'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Home() {
  const showMVP = process.env.SHOW_MVP === "true"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] pt-32 pb-12">
          <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="absolute -left-6 -top-6 animate-pulse">
                <Zap className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="font-header text-5xl font-bold leading-tight tracking-tighter md:text-7xl lg:text-8xl lg:leading-[1.1] gradient-text">
                Speak with Impact.
                <br />
                Get Instant AI Feedback.
              </h1>
              <div className="absolute -right-6 -top-6 animate-pulse">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="max-w-[700px] text-xl text-muted-foreground sm:text-2xl">
              Tired of filler words and fast talking? Get instant AI feedback to sound sharp, speak clearly, and own the room.
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              {showMVP && (
                <Link
                  href="/practice"
                  className="group inline-flex items-center justify-center rounded-md text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow hover:opacity-90 h-14 px-10 hover:scale-105 hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]"
                >
                  Try a Sample Prompt
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <div className="flex flex-col items-center">
                <a
                  href="#waitlist"
                  className="group inline-flex items-center justify-center rounded-md text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow hover:opacity-90 h-14 px-10 hover:scale-105 hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]"
                >
                  Get Early Access 🔓
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
                <small className="block text-muted-foreground text-sm mt-1">
                  No sign-up hoops. Try it in under 30 seconds.
                </small>
              </div>
              <a
                href="#who-is-crisp"
                className="inline-flex items-center justify-center rounded-md text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-14 px-10 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
              >
                What is Crisp?
              </a>
            </div>
          </div>
        </div>

        <section id="who-is-crisp" className="w-full py-16 md:py-24 relative overflow-hidden">
          <div className="gradient-overlay" />
          <div className="container relative">
            <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-8 text-center">
              <div className="space-y-6">
                <h2 className="font-header text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text max-w-[1000px] mx-auto">
                  Built for Founders, PMs, and Leaders Who Need Their Voice to Hit
                </h2>
                <p className="text-xl md:text-2xl leading-snug text-muted-foreground max-w-[800px] mx-auto">
                  You have the ideas. We&apos;ll help you make sure they land.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
                {[
                  {
                    title: "For Founders",
                    description: "Make your boldest ideas easy to follow, and impossible to ignore."
                  },
                  {
                    title: "For PMs",
                    description: "Explain complex decisions clearly. Make your roadmap hit with every stakeholder."
                  },
                  {
                    title: "For Leaders",
                    description: "Lead with clarity. Speak so your team listens and acts."
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "group relative rounded-2xl glass-card p-8 transition-all hover:scale-[1.02]",
                      "hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/30"
                    )}
                  >
                    <div className="relative flex flex-col items-center space-y-4 text-center">
                      <h3 className="font-header text-2xl font-bold text-foreground">{item.title}</h3>
                      <p className="text-lg text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <WhyItMatters />
        <HowItWorks />

        <section id="waitlist" className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="gradient-overlay" />
          <div className="container relative">
            <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-8 text-center">
              <div className="space-y-6">
                <h2 className="font-header text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text">
                  Join the Private Beta
                </h2>
                <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl/relaxed">
                  Be among the first to experience Crisp. Get early access and shape the future of communication.
                </p>
              </div>
              <div className="w-full max-w-[600px] glass-card p-8 rounded-2xl">
                <WaitlistForm />
              </div>
              <p className="text-sm text-muted-foreground">
                By joining, you agree to our{' '}
                <a href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </a>
                . We respect your inbox and will only send you important updates.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
} 