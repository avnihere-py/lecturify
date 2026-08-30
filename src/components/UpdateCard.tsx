const TYPE_LABELS: Record<string, string> = {
  cancellation: 'Cancelled',
  schedule: 'Schedule',
  exam: 'Exam',
  general: 'Notice',
  holiday: 'Holiday',
}

interface UpdateCardProps {
  title: string
  message: string
  type: string
  postedBy: { name: string; role: 'teacher' | 'cr' }
  createdAt: string
}

export function UpdateCard({ title, message, type, postedBy, createdAt }: UpdateCardProps) {
  const date = new Date(createdAt)
  const timeAgo = getTimeAgo(date)

  return (
    <article className={`update-card update-card--${type}`}>
      <div className="update-card__header">
        <span className="official-badge">Official</span>
        <span className={`type-badge type-badge--${type}`}>{TYPE_LABELS[type] ?? type}</span>
      </div>
      <h3 className="update-card__title">{title}</h3>
      <p className="update-card__message">{message}</p>
      <footer className="update-card__footer">
        <span className="update-card__author">
          {postedBy.role === 'teacher' ? '👩‍🏫' : '⭐'} {postedBy.name}
          {postedBy.role === 'cr' && <span className="cr-tag">Class Rep</span>}
        </span>
        <time dateTime={createdAt}>{timeAgo}</time>
      </footer>
    </article>
  )
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
