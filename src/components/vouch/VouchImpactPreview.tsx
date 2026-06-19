import { ArrowRight, Award, DollarSign, TrendingDown } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { VouchRequest } from '../../types'

const VOUCH_REPUTATION_BOOST = 12

interface VouchImpactPreviewProps {
  request: VouchRequest
  onConfirm: () => void
  onClose: () => void
  confirming: boolean
}

export function VouchImpactPreview({
  request,
  onConfirm,
  onClose,
  confirming,
}: VouchImpactPreviewProps) {
  const currentRate = 8
  const boostedScore = request.score + VOUCH_REPUTATION_BOOST
  const newRate = 6

  const impacts = [
    {
      label: 'Reputation Score',
      before: request.score.toString(),
      after: boostedScore.toString(),
      icon: Award,
      color: '#F59E0B',
    },
    {
      label: 'Interest Rate',
      before: `${currentRate}%`,
      after: `${newRate}%`,
      icon: TrendingDown,
      color: '#22C55E',
    },
    {
      label: 'Monthly Payment (est.)',
      before: `$${Math.round(request.loanAmount * (currentRate / 100) / 12).toLocaleString()}`,
      after: `$${Math.round(request.loanAmount * (newRate / 100) / 12).toLocaleString()}`,
      icon: DollarSign,
      color: '#2563EB',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg">
        <Card className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={20} className="text-brand" />
              <h3 className="font-display font-bold text-xl text-text-primary">
                Vouch Impact Preview
              </h3>
            </div>
            <p className="text-text-muted text-sm">
              You are about to vouch for{' '}
              <span className="font-mono text-text-primary">
                {request.learnerWallet}
              </span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated/50 border border-border space-y-4">
            {impacts.map((impact) => (
              <div key={impact.label} className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ background: `${impact.color}15` }}
                >
                  <impact.icon size={18} style={{ color: impact.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                    {impact.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-text-secondary text-sm">{impact.before}</span>
                    <ArrowRight size={14} className="text-brand" />
                    <span className="text-text-primary font-display font-bold text-lg">
                      {impact.after}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-brand/10 border border-brand/20 flex items-start gap-2">
            <Award size={16} className="text-brand shrink-0 mt-0.5" />
            <p className="text-text-primary text-sm">
              A Silver tier vouch adds <strong>{VOUCH_REPUTATION_BOOST} reputation points</strong>,
              reducing the learner's interest rate from <strong>{currentRate}% to {newRate}%</strong>.
              This transaction requires wallet signing.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={confirming}>
              Cancel
            </Button>
            <Button onClick={onConfirm} loading={confirming}>
              <Award size={16} />
              Confirm & Sign
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
