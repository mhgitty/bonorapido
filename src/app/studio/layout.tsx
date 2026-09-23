export const metadata = { title: 'Bonorapido Studio' }

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html, body { height: 100%; background: #101112 !important; }`}</style>
      {children}
    </>
  )
}
