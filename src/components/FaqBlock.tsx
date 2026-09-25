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
    <div style={{ margin: '32px 0' }}>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
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
                <svg className="faq-chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item.question}</span>
              </button>
              {isOpen && <div className="faq-a">{item.answer}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
