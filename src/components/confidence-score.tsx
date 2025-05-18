import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConfidenceScoreProps {
  score: number;
  label: string;
  tagline: string;
}

export function ConfidenceScore({ score, label, tagline }: ConfidenceScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent delivery'
    if (score >= 75) return 'Strong performance'
    if (score >= 60) return 'Developing skills'
    return 'Needs improvement'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{score}</h3>
              <p className={`text-sm font-medium ${getScoreColor(score)}`}>{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{getScoreDescription(score)}</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 