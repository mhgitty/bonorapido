'use client'

const ICONS: Record<string, string> = {
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  x: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z',
  facebook: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z',
}

/** Share the current page on LinkedIn, X or Facebook. */
export function ShareButtons() {
  const share = (net: string) => {
    const url = encodeURIComponent(window.location.href.split('#')[0])
    const text = encodeURIComponent(document.title)
    const href = net === 'linkedin'
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      : net === 'x'
        ? `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        : `https://www.facebook.com/sharer/sharer.php?u=${url}`
    window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560')
  }
  return (
    <div className="share-btns" aria-label="Compartir">
      {(['linkedin', 'x', 'facebook'] as const).map((n) => (
        <button key={n} type="button" onClick={() => share(n)} aria-label={`Compartir en ${n === 'x' ? 'X' : n === 'linkedin' ? 'LinkedIn' : 'Facebook'}`}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d={ICONS[n]} /></svg>
        </button>
      ))}
    </div>
  )
}
