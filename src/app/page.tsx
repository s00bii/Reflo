import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>Reflo</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: '14px', fontWeight: 500, color: '#374151',
            textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
            border: '1px solid #e5e7eb', backgroundColor: '#ffffff',
          }}>
            Log in
          </Link>
          <Link href="/signup" style={{
            fontSize: '14px', fontWeight: 600, color: '#ffffff',
            textDecoration: 'none', padding: '8px 16px',
            borderRadius: '8px', backgroundColor: '#16a34a',
          }}>
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 'calc(100vh - 65px)',
        padding: '40px 20px', textAlign: 'center',
      }}>

        <div style={{
          display: 'inline-block', backgroundColor: '#dcfce7', color: '#15803d',
          fontSize: '13px', fontWeight: 600, padding: '6px 14px',
          borderRadius: '9999px', marginBottom: '24px', letterSpacing: '0.02em',
        }}>
          Closing the loop on waste cooking oil
        </div>

        <h1 style={{
          fontSize: '52px', fontWeight: 700, color: '#111827',
          margin: '0 0 20px', lineHeight: 1.15, maxWidth: '640px',
        }}>
          Turn waste oil into{' '}
          <span style={{ color: '#16a34a' }}>clean fuel</span>
        </h1>

        <p style={{
          fontSize: '18px', color: '#6b7280', maxWidth: '480px',
          lineHeight: 1.7, margin: '0 0 40px',
        }}>
          Reflo connects restaurants with excess cooking oil to biodiesel converters — creating a circular economy for one of the most wasted industrial byproducts in the food industry.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{
            fontSize: '15px', fontWeight: 600, color: '#ffffff',
            textDecoration: 'none', padding: '14px 28px',
            borderRadius: '10px', backgroundColor: '#16a34a',
          }}>
            Get started
          </Link>
          <Link href="https://your-pdf-url-here.com" target="_blank" rel="noreferrer" style={{
            fontSize: '15px', fontWeight: 500, color: '#374151',
            textDecoration: 'none', padding: '14px 28px', borderRadius: '10px',
            backgroundColor: '#ffffff', border: '1px solid #e5e7eb',
          }}>
            Oil preparation guide
          </Link>
        </div>

        {/* Three value props */}
        <div style={{
          display: 'flex', gap: '24px', marginTop: '80px',
          flexWrap: 'wrap', justifyContent: 'center', maxWidth: '780px',
        }}>
          {[
            { emoji: '🍟', title: 'For restaurants', desc: 'Turn disposal costs into earnings. Post your used oil in minutes.' },
            { emoji: '⚡', title: 'For converters', desc: 'Browse verified oil supply near you. Dynamic pricing based on real fuel markets.' },
            { emoji: '🌱', title: 'For the planet', desc: 'Every litre diverted from waste becomes clean biodiesel fuel.' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} style={{
              backgroundColor: '#ffffff', borderRadius: '16px',
              border: '1px solid #e5e7eb', padding: '24px',
              width: '220px', textAlign: 'left',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{emoji}</div>
              <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 8px', fontSize: '15px' }}>{title}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}