'use client'
import { useState } from 'react'

interface FaqBlockProps { value: { items?: { question: string; answer: string }[] } }

export function FaqBlock({ value }: FaqBlockProps) {
  const { items = [] } = value
  const [open, setOpen] = useState<number | null>(0)

  // Emit FAQPage structured data for any FAQ block, on any page that renders it.
  const faqs = items.filter((i) => i?.question && i?.answer)
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  return (
    <div className="faq">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="rp-kicker-row">
        <span className="rp-kicker">Preguntas frecuentes</span>
        <span className="ht-chip">{faqs.length} {faqs.length === 1 ? 'pregunta' : 'preguntas'}</span>
      </div>
      <div className="faq-list">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} className={`faq-item${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="faq-q"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="faq-toggle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="faq-qtext">{item.question}</span>
                <span className="faq-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              </button>
              {/* Answer is always in the DOM (good for SEO); height animates open/closed */}
              <div className="faq-a-wrap" aria-hidden={!isOpen}>
                <div className="faq-a-inner"><div className="faq-a">{item.answer}</div></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
