import Link from 'next/link'
import { Icon } from './Icon'
import { ShareButtons } from './ShareButtons'

interface Author {
  name: string
  slug?: { current: string } | null
  linkedin?: string | null
  imageUrl?: string | null
}

interface AuthorBarProps {
  author?: Author | null
  factChecker?: Author | null
  updatedAt?: string | null
  /** Show LinkedIn / X / Facebook share buttons on the right. */
  share?: boolean
}

function Person({ person, label }: { person: Author; label: string }) {
  const href = person.slug?.current ? `/autor/${person.slug.current}/` : null
  const name = href
    ? <Link href={href} className="author-bar-name">{person.name}</Link>
    : <span className="author-bar-name">{person.name}</span>
  return (
    <div className="author-bar-item">
      {person.imageUrl
        ? <img src={person.imageUrl} alt={person.name} className="author-bar-avatar" />
        : <span className="author-bar-avatar author-bar-avatar--initial">{person.name.charAt(0)}</span>}
      <div>
        <div className="author-bar-label">{label}</div>
        {name}
      </div>
    </div>
  )
}

/** Byline under the H1: author, fact checker, last updated date and share buttons. */
export function AuthorBar({ author, factChecker, updatedAt, share = true }: AuthorBarProps) {
  const date = updatedAt ? new Date(updatedAt) : null
  const dateStr = date && !isNaN(date.getTime())
    ? date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' }).replace('.', '')
    : null

  if (!author && !factChecker && !dateStr) return null

  return (
    <div className="author-bar">
      {author && <Person person={author} label="Escrito por" />}
      {factChecker && <Person person={factChecker} label="Verificado por" />}
      {dateStr && (
        <div className="author-bar-item">
          <span className="author-bar-icon"><Icon name="calendar-mark" size={20} color="var(--green)" /></span>
          <div>
            <div className="author-bar-label">Última actualización</div>
            <time className="author-bar-name" dateTime={date!.toISOString()}>{dateStr}</time>
          </div>
        </div>
      )}
      {share && <ShareButtons />}
    </div>
  )
}
