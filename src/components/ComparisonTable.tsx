import { BonusCard } from './BonusCard'
import { CasinoComparisonTable } from './CasinoComparisonTable'

// Data comes from the comparisonTableTemplate document (expanded by the query)
interface ComparisonTableData {
  tableType?: 'bonus' | 'bookmaker'
  bonuses?: any[]
  bookmakers?: any[]
}

interface ComparisonTableProps {
  data?: ComparisonTableData | null
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  if (!data) return null

  let inner: React.ReactNode = null
  if (data.tableType === 'bookmaker') {
    const items = data.bookmakers || []
    if (!items.length) return null
    inner = <CasinoComparisonTable casinos={items} />
  } else {
    const items = data.bonuses || []
    if (!items.length) return null
    inner = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((bonus: any, i: number) => (
          <BonusCard key={bonus._id} {...bonus} rank={i + 1} />
        ))}
      </div>
    )
  }

  // Scroll target for the hero "jump to comparison list" button, on every page.
  return <div id="comparison-list" style={{ scrollMarginTop: '80px' }}>{inner}</div>
}
