interface TableBlockValue {
  title?: string
  headers?: string[]
  rows?: Array<{ cells?: string[] }>
}

/** Content table in the Bonorapido "rápido" style: gradient-topped header, first column emphasised. */
export function TableBlock({ value }: { value: TableBlockValue }) {
  const { title, headers, rows } = value
  const hasHeaders = (headers?.length ?? 0) > 0
  const cols = Math.max(headers?.length ?? 0, ...(rows ?? []).map((r) => r.cells?.length ?? 0))

  return (
    <div className="rp-table">
      {title && (
        <div className="rp-kicker-row">
          <span className="rp-kicker">{title}</span>
        </div>
      )}
      <div className="rp-table-frame">
        <div className="rp-table-scroll">
          <table className={cols > 3 ? 'is-wide' : undefined}>
            {hasHeaders && (
              <thead>
                <tr>{(headers ?? []).map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {(rows ?? []).map((row, ri) => (
                <tr key={ri}>
                  {(row.cells ?? []).map((cell, ci) => <td key={ci}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
