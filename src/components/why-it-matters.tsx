import * as React from 'react'
import { Zap, Clock, Target, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

const problems = [
  {
    icon: Zap,
    problem: "Make your ideas land with clarity",
    solution: "Structure your thoughts and deliver them with impact."
  },
  {
    icon: Clock,
    problem: "Speak with clarity in every meeting",
    solution: "Get real-time feedback to engage and lead better."
  },
  {
    icon: Target,
    problem: "Craft messages that stick",
    solution: "Learn to tell memorable, compelling stories."
  },
  {
    icon: Rocket,
    problem: "Build confidence through clarity",
    solution: "Practice until you feel ready for any room."
  }
]

export function WhyItMatters() {
  return (
    <section className="w-full py-24 md:py-32 relative overflow-hidden">
      <div className="gradient-overlay" />
      <div className="container relative">
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-8">
          <div className="space-y-6 text-center">
            <h2 className="font-header text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text">
              Why It Matters
            </h2>
            <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl/relaxed">
              Communication is your superpower. Here&apos;s how we help you unlock it.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 w-full">
            {problems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "group relative rounded-2xl glass-card p-8 transition-all hover:scale-[1.02]",
                  "hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/30"
                )}
              >
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                    <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-header text-2xl font-bold text-foreground leading-snug">
                    {item.problem}
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 