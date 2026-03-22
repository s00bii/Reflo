import Link from 'next/link'

export default function OilPrepGuidePage() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid #D1E8B0',
        }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', justifySelf: 'start' }}>
            <img src="/logo.png" alt="Reflo" style={{ width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer' }} />
        </Link>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            {[
            { label: 'HOME', href: '/' },
            { label: 'OIL PREP GUIDE', href: '/oil-prep-guide' },
            { label: 'ABOUT US', href: '/#' },
            { label: 'LOGIN/SIGN UP', href: '/login' },
            ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
                fontSize: '14px', fontWeight: label === 'OIL PREP GUIDE' ? 700 : 400,
                color: '#448383', textDecoration: 'none', letterSpacing: '0.05em',
            }}>
                {label}
            </Link>
            ))}
        </div>
        <div />
        </nav>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}>

        <p style={{ fontSize: '14px', color: '#62B794', fontStyle: 'italic', textAlign: 'center', margin: '0 0 8px' }}>
          Here&apos;s what you need to know about
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#448383', textAlign: 'center', margin: '0 0 32px', lineHeight: 1.3 }}>
          USED COOKING OIL (UCO) 🍁 STORAGE &amp; HANDLING GUIDES
        </h1>

        <p style={{ fontSize: '15px', fontWeight: 700, color: '#448383', fontStyle: 'italic', margin: '0 0 24px' }}>
          For Restaurant Staff 🧑‍🍳
        </p>

        {[
          {
            title: 'BEFORE STORING OIL',
            items: [
              'Oil has been allowed to cool before handling',
              'Food particles are strained out (if possible)',
            ],
          },
          {
            title: 'CONTAINER CHECK',
            items: [
              'Container is clean and dry',
              'Container has a secure, tight-fitting lid',
              'Container has not been used for chemicals or cleaners',
            ],
          },
          {
            title: 'CONTAMINATION PREVENTION',
            items: [
              'Only used cooking oil is added',
              'Confirm NONE of the following are in the container:',
              'Water or ice',
              'Food scraps or solids',
              'Soap, chemicals, or cleaning liquids',
            ],
          },
          {
            title: 'STORAGE CONDITIONS',
            items: [
              'Stored in a cool, shaded area',
              'Kept away from direct sunlight and heat sources',
              'Located away from garbage or chemical storage',
            ],
          },
          {
            title: 'MOISTURE CONTROL',
            items: [
              'Container is kept sealed when not in use',
              'No exposure to rain, spills, or condensation',
            ],
          },
          {
            title: 'STORAGE TIME',
            items: [
              'Oil has been stored for less than 2–4 weeks',
            ],
          },
          {
            title: 'LABELLING (RECOMMENDED)',
            items: [
              'Container is labeled with date of first use',
            ],
          },
          {
            title: 'PICKUP READINESS',
            items: [
              'Container is easily accessible for collection',
              'Container is not overfilled (space left at the top)',
            ],
          },
          {
            title: 'FINAL QUALITY CHECK',
            items: [
              'Before pickup, confirm:',
              'Oil is clean (no debris)',
              'Oil is dry (no water)',
              'Container is sealed',
              'Oil is fresh',
            ],
          },
        ].map(({ title, items }) => (
          <div key={title} style={{ marginBottom: '28px' }}>
            <p style={{
              fontSize: '15px', fontWeight: 700, color: '#448383',
              textDecoration: 'underline', textTransform: 'uppercase',
              margin: '0 0 10px', letterSpacing: '0.03em',
            }}>
              {title}
            </p>
            <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map((item, i) => (
                <p key={i} style={{ fontSize: '15px', color: '#62B794', margin: 0, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#448383', flexShrink: 0 }}>□</span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}