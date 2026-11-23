import Link from 'next/link'
import React from 'react'

/** Eintrag in der Admin-Navigation zur Like-Statistik. */
export function LikeStatsLink() {
  return (
    <Link href="/admin/like-statistik" className="nav__link like-stats__nav">
      Like-Statistik
    </Link>
  )
}
