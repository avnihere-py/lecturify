import { useAuth } from '../context/AuthContext'

export function CampusBanner() {
  const { data } = useAuth()
  const alert = data.campusAlerts[0]
  if (!alert) return null
  return (
    <div className="campus-alert" role="status">
      <span className="campus-alert__icon" aria-hidden>📢</span>
      <div className="campus-alert__body">
        <strong>{alert.title}</strong>
        <p>{alert.message}</p>
      </div>
    </div>
  )
}
