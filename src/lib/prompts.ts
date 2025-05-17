export type PromptCategory = 'self' | 'opinion' | 'creativity' | 'story' | 'product'

export interface Prompt {
  id: string
  text: string
  category: PromptCategory
  emoji: string
}

export const prompts: Prompt[] = [
  // Self
  {
    id: 'self-1',
    text: "Tell me about yourself.",
    category: 'self',
    emoji: '🧠'
  },
  {
    id: 'self-2',
    text: "What's a personal value you try to live by?",
    category: 'self',
    emoji: '🧠'
  },
  {
    id: 'self-3',
    text: "What's something not on your resume?",
    category: 'self',
    emoji: '🧠'
  },

  // Opinion
  {
    id: 'opinion-1',
    text: "What's a popular opinion you disagree with?",
    category: 'opinion',
    emoji: '🔥'
  },
  {
    id: 'opinion-2',
    text: "Do you think remote work is here to stay?",
    category: 'opinion',
    emoji: '🔥'
  },
  {
    id: 'opinion-3',
    text: "What's a trend you wish would die?",
    category: 'opinion',
    emoji: '🔥'
  },

  // Creativity
  {
    id: 'creativity-1',
    text: "If you had a billboard in Times Square, what would it say?",
    category: 'creativity',
    emoji: '🎨'
  },
  {
    id: 'creativity-2',
    text: "Design your dream app in 30 seconds.",
    category: 'creativity',
    emoji: '🎨'
  },

  // Storytelling
  {
    id: 'story-1',
    text: "Tell me about a time you took a risk.",
    category: 'story',
    emoji: '📖'
  },
  {
    id: 'story-2',
    text: "What's a lesson you learned the hard way?",
    category: 'story',
    emoji: '📖'
  },

  // Product/Tech
  {
    id: 'product-1',
    text: "How would you explain your product to your grandma?",
    category: 'product',
    emoji: '🛠️'
  },
  {
    id: 'product-2',
    text: "How would you improve LinkedIn?",
    category: 'product',
    emoji: '🛠️'
  }
]

export function getRandomPrompt(excludeId?: string, category?: PromptCategory): Prompt {
  const filteredPrompts = prompts.filter(p => {
    const categoryMatch = category ? p.category === category : true
    const idMatch = excludeId ? p.id !== excludeId : true
    return categoryMatch && idMatch
  })
  return filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)]
} 