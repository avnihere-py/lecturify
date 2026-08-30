import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function Home() {
  return (
    <div className="home-page">
      <div className="home-page__decor home-page__decor--1" />
      <div className="home-page__decor home-page__decor--2" />
      <div className="home-page__content">
        <Logo size="lg" />
        <p className="home-page__subtitle">
          Official college updates — verified by your teachers. No noise, just what matters.
        </p>
        <div className="home-page__cards">
          <Link to="/student/login" className="role-card role-card--student">
            <span className="role-card__icon">🎓</span>
            <h2>Student</h2>
            <p>View official class updates &amp; alerts</p>
          </Link>
          <Link to="/teacher/login" className="role-card role-card--teacher">
            <span className="role-card__icon">👩‍🏫</span>
            <h2>Teacher</h2>
            <p>Post updates &amp; manage class reps</p>
          </Link>
        </div>
        <p className="home-page__enroll">
          New student? <Link to="/student/enroll">Enroll with your enrollment number</Link>
        </p>
      </div>
    </div>
  )
}
