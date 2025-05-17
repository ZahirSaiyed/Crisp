import * as React from 'react'
import { Mic, MessageSquare, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 md:py-32 relative overflow-hidden">
      <div className="gradient-overlay" style={{ willChange: 'transform' }} data-parallax />
      <div className="container relative">
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-8">
          <div className="space-y-6 text-center">
            <h2 className="font-header text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text">
              How It Works
            </h2>
            <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl/relaxed">
              Three simple steps to transform your communication game.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16 w-full">
            {/* Card 1 */}
            <div className={cn(
              "group relative rounded-2xl glass-card p-8 transition-all hover:scale-[1.02]",
              "hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/30 w-full md:w-[320px]"
            )}>
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-header text-2xl font-bold text-foreground">Record Your Voice</h3>
                <p className="text-lg text-muted-foreground">Practice your pitch, presentation, or daily communication.</p>
              </div>
            </div>
            {/* Arrow 1 */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight 
                className="h-8 w-8 text-primary drop-shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full p-1"
                style={{ filter: 'blur(0.5px)' }}
              />
            </div>
            {/* Card 2 */}
            <div className={cn(
              "group relative rounded-2xl glass-card p-8 transition-all hover:scale-[1.02]",
              "hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/30 w-full md:w-[320px]"
            )}>
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-header text-2xl font-bold text-foreground">Get Instant Feedback</h3>
                <p className="text-lg text-muted-foreground">AI-powered insights on clarity, pace, and impact.</p>
              </div>
            </div>
            {/* Arrow 2 */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight 
                className="h-8 w-8 text-primary drop-shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full p-1"
                style={{ filter: 'blur(0.5px)' }}
              />
            </div>
            {/* Card 3 */}
            <div className={cn(
              "group relative rounded-2xl glass-card p-8 transition-all hover:scale-[1.02]",
              "hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/30 w-full md:w-[320px]"
            )}>
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-header text-2xl font-bold text-foreground">Level Up Fast</h3>
                <p className="text-lg text-muted-foreground">Personalized tips to make your message hit harder.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 