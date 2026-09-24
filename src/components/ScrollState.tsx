'use client'

import { useEffect } from 'react'

/** Adds `is-scrolled` to <html> once the page is scrolled (used to restyle the sticky navbar). */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement
    const update = () => root.classList.toggle('is-scrolled', window.scrollY > 4)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return null
}
