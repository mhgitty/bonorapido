import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/components/Icon'
import { RichIntro } from '@/components/RichIntro'
import { replaceDateVars } from '@/lib/dateVars'

interface HeroCasino {
  _key: string
  bonusText?: string
  url?: string
  bookmaker?: { name?: string; url?: string; indbetalingsbonus?: string; logoUrl?: string; logoAlt?: string } | null
}
interface HeroCard { _key: string; title: string; icon?: string; href: string }

interface Props {
  title: string
  intro?: string | any[]
  casinos?: HeroCasino[]
  buttons?: HeroCard[]
}

/**
 * Homepage hero: centred H1 + intro, then up to 4 featured casino cards and
 * up to 4 quick-link buttons (both chosen in the homepage settings in Studio).
 */
export function HomeTopHero({ title, intro, casinos = [], buttons = [] }: Props) {
  const hasIntro = Array.isArray(intro) ? intro.length > 0 : !!intro
  const cas = casinos.filter((c) => c?.bookmaker?.name).slice(0, 4)
  const btns = buttons.filter((b) => b?.title && b?.href).slice(0, 4)

  return (
    <section className="home-top-hero">
      <div className="home-top-hero-inner">
        <h1 className="home-top-hero-title">{replaceDateVars(title)}</h1>
        {hasIntro && (
          <div className="home-top-hero-intro">
            {typeof intro === 'string' ? replaceDateVars(intro) : <RichIntro value={intro} />}
          </div>
        )}

        {cas.length > 0 && (
          <div className="home-top-casinos">
            {cas.map((c) => {
              const bm = c.bookmaker!
              const href = c.url || bm.url || '#'
              const bonus = c.bonusText || bm.indbetalingsbonus || ''
              const external = /^https?:/.test(href)
              return (
                <a
                  key={c._key}
                  href={href}
                  className="home-top-casino"
                  {...(external || href.includes('/go/') ? { target: '_blank', rel: 'nofollow sponsored noopener' } : {})}
                >
                  <span className="home-top-casino-logo">
                    {bm.logoUrl && (
                      <Image src={bm.logoUrl} alt={bm.logoAlt || bm.name || ''} width={60} height={60} />
                    )}
                  </span>
                  <span className="home-top-casino-text">
                    <span className="home-top-casino-name">{bm.name}</span>
                    {bonus && <span className="home-top-casino-bonus">{replaceDateVars(bonus)}</span>}
                  </span>
                </a>
              )
            })}
          </div>
        )}

        {btns.length > 0 && (
          <div className="home-top-buttons">
            {btns.map((b) => (
              <Link key={b._key} href={b.href} className="home-top-button">
                {b.icon && <Icon name={b.icon} size={34} color="#fff" />}
                <span>{b.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
