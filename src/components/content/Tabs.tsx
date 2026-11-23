'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

export type TabItem = { id: string; label: string; content: React.ReactNode }

/**
 * Barrierefreie Tabs (WAI-ARIA Tabs-Muster, Pfeiltasten). Ohne JavaScript bleiben alle Panels sichtbar,
 * weil nur der Client das Ausblenden steuert. Hash in der URL (#thema) öffnet den passenden Tab.
 */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const base = useId()
  const [active, setActive] = useState(0)
  // Erst nach dem Laden ausblenden: ohne JavaScript bleiben alle Panels sichtbar
  const [ready, setReady] = useState(false)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const ids = items.map((item) => item.id).join('|')

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const index = ids.split('|').findIndex((id) => `#${id}` === window.location.hash)
      if (index >= 0) setActive(index)
      setReady(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [ids])

  const select = (index: number) => {
    setActive(index)
    refs.current[index]?.focus()
    history.replaceState(null, '', `#${items[index].id}`)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = items.length - 1
    if (event.key === 'ArrowRight') select(active === last ? 0 : active + 1)
    else if (event.key === 'ArrowLeft') select(active === 0 ? last : active - 1)
    else if (event.key === 'Home') select(0)
    else if (event.key === 'End') select(last)
    else return
    event.preventDefault()
  }

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tabs__list" onKeyDown={onKeyDown}>
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${i}`}
            aria-controls={`${base}-panel-${i}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className="tabs__tab"
            onClick={() => select(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          hidden={ready && i !== active}
          tabIndex={0}
          className="tabs__panel"
        >
          <span id={item.id} className="anchor" />
          {item.content}
        </div>
      ))}
    </div>
  )
}
