interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md' }: LogoProps) {
  return (
    <div className={`logo logo--${size}`}>
      <img src="/logo.png" alt="Lecturify" className="logo__img" />
      {size !== 'sm' && (
        <div className="logo__text">
          <h1 className="logo__name">Lecturify</h1>
          <p className="logo__tagline">Check your schedule without hustle</p>
        </div>
      )}
    </div>
  )
}
