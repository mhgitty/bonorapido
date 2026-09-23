import Link from 'next/link'
import { draftMode } from 'next/headers'

export default async function NotFound() {
  let isPreview = false
  try {
    isPreview = (await draftMode()).isEnabled
  } catch {
    isPreview = false
  }

  return (
    <div
      style={{
        minHeight: '70vh',
        background: 'var(--bg-hero)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '560px', textAlign: 'center' }}>
        {isPreview ? (
          <>
            <div style={{
              display: 'inline-block',
              background: 'rgba(26,122,60,0.1)', color: 'var(--green)',
              fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
              padding: '4px 12px', borderRadius: '20px', marginBottom: '18px',
            }}>
              Vista previa del borrador
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em',
              lineHeight: 1.15, margin: '0 0 14px',
            }}>
              No se ha podido cargar este borrador para la vista previa
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 24px' }}>
              La página aún no está publicada y no se ha podido leer el borrador.
              Normalmente significa que falta un <strong>SANITY_API_READ_TOKEN</strong>{' '}
              válido (un token de Viewer del proyecto de Sanity). Cuando se configure esa variable de entorno y se
              vuelva a desplegar el sitio, la vista previa de borradores funcionará.
            </p>
          </>
        ) : (
          <>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em',
              lineHeight: 1.15, margin: '0 0 14px',
            }}>
              Página no encontrada
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 24px' }}>
              La página que buscas no existe o se ha movido.
            </p>
          </>
        )}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'var(--green)', color: '#fff',
            fontSize: '15px', fontWeight: 700,
            padding: '12px 22px', borderRadius: '10px', textDecoration: 'none',
          }}
        >
          Ir a la página de inicio
        </Link>
      </div>
    </div>
  )
}
