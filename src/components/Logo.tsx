interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md' }: LogoProps) {
  return (
    <div className={`logo logo--${size}`}>
      <img src="/logo.png" alt="Lecturify — Check your schedule without hustle" className="logo__img" />
    </div>
  )
}
