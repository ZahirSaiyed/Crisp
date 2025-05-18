'use client'

import * as React from 'react'
import { Play, Mic, MessageSquare, LineChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function ProductPreview() {
  return (
    <section id="product-preview" className="w-full py-24 md:py-32 relative overflow-hidden">
      <div className="gradient-overlay" />
      <div className="container relative">
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-12">
          <div className="space-y-6 text-center">
            <h2 className="font-header text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text">
              See Crisp in Action
            </h2>
            <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl/relaxed">
              Watch how Crisp transforms your speaking in real-time
            </p>
          </div>

          {/* Demo Video/Preview */}
          <div className="w-full max-w-[800px] aspect-video rounded-2xl overflow-hidden glass-card relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
              >
                <Play className="w-8 h-8 text-primary" />
              </motion.button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid gap-8 md:grid-cols-3 w-full">
            {[
              {
                icon: Mic,
                title: "Real-time Recording",
                description: "Speak naturally while getting instant feedback on your delivery."
              },
              {
                icon: MessageSquare,
                title: "Smart Analysis",
                description: "Get insights on filler words, pace, and clarity as you speak."
              },
              {
                icon: LineChart,
                title: "Track Progress",
                description: "Watch your speaking skills improve over time with detailed metrics."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative rounded-2xl glass-card p-8 transition-all",
                  "hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/30"
                )}
              >
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-header text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 