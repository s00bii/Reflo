import type { CSSProperties } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const navLink: CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: '#448383',
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '8px 16px',
  }

  const pillBtn: CSSProperties = {
    borderRadius: '9999px',
    border: 'none',
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'inherit' }}>
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          backgroundColor: '#ffffff',
        }}
      >
        <img src="/logo.png" alt="Reflo" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={navLink}>
            Home
          </Link>
          <a href="/oil-prep-guide" style={navLink}>
            Oil prep guide
          </a>
          <a href="#" style={navLink}>
            About us
          </a>
          <Link href="/login" style={navLink}>
            Login 
          </Link>
        </div>
        <div style={{ width: '56px', flexShrink: 0 }} aria-hidden />
      </nav>

      {/* Hero — two columns */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          minHeight: 'calc(100vh - 88px)',
          padding: '0 32px 48px',
          gap: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: '1 1 50%',
            maxWidth: '560px',
            paddingRight: '24px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#62B794',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: '0 0 16px',
            }}
          >
            Turn waste oil 🍁 into clean fuel with
          </p>
          <h1
            style={{
              fontSize: 'clamp(80px, 10vw, 120px)',
              fontWeight: 700,
              color: '#448383',
              margin: '0 0 24px',
              lineHeight: 1.02,
            }}
          >
            REFLO
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: '#62B794',
              fontStyle: 'italic',
              maxWidth: '500px',
              lineHeight: 1.7,
              margin: '0 0 32px',
            }}
          >
            We connect restaurants with excess cooking oil to biodiesel converters – creating a circular economy for one of the most wasteful industrial byproducts in the food industry
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                ...pillBtn,
                backgroundColor: '#D1E8B0',
                color: '#448383',
              }}
            >
              Get Started
            </Link>
            <a
              href="/oil-prep-guide"
              style={{
                ...pillBtn,
                backgroundColor: '#D1E8B0',
                color: '#448383',
              }}
            >
              Learn More
            </a>
          </div>
        </div>
        <div
          style={{
            flex: '1 1 50%',
            height: '100%',
            minHeight: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/forest.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              maxHeight: 'min(80vh, 640px)',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
