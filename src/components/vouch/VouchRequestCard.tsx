import { Award, DollarSign, FileText, ExternalLink, XCircle, UserCheck } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import type { VouchRequest } from '../../types'

const TIER_VARIANTS: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'muted'> = {
  Gold: 'amber',
  Silver: 'muted',
  Bronze: 'amber',
  Starter: 'green',
}

interface VouchRequestCardProps {
  request: VouchRequest
  onReviewProfile: (wallet: string) => void
  onVouch: (request: VouchRequest) => void
  onDecline: (id: string) => void
  declining: boolean
}

export function VouchRequestCard({
  request,
  onReviewProfile,
  onVouch,
  onDecline,
  declining,
}: VouchRequestCardProps) {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-brand/10 border border-brand/20">
              <Award size={16} className="text-brand" />
            </div>
            <span className="text-text-primary font-mono text-sm font-medium truncate">
              {request.learnerWallet}
            </span>
            <Badge label={request.tier} variant={TIER_VARIANTS[request.tier] ?? 'muted'} />
          </div>

          <div className="flex items-center gap-4 flex-wrap text-sm text-text-muted mb-2">
            <span className="flex items-center gap-1">
              <Award size={14} />
              Score: {request.score}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={14} />
              Loan: ${request.loanAmount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {request.purpose}
            </span>
          </div>

          {request.skills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {request.skills.map((skill) => (
                <Badge key={skill} label={skill} variant="blue" />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReviewProfile(request.learnerAddress)}
          >
            <ExternalLink size={14} />
            Profile
          </Button>
          <Button
            size="sm"
            onClick={() => onVouch(request)}
          >
            <UserCheck size={14} />
            Vouch
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDecline(request.id)}
            loading={declining}
          >
            <XCircle size={14} />
            Decline
          </Button>
        </div>
      </div>
    </Card>
  )
}
