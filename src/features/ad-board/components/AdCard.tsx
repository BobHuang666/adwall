import { useEffect, useRef, useState } from 'react'
import type { Ad } from '@shared/types/ad'
import { formatCurrency } from '@shared/utils/bid'

type AdCardProps = {
  ad: Ad
  onEdit: (ad: Ad) => void
  onDuplicate: (ad: Ad) => void
  onDelete: (ad: Ad) => void
  onClickAd: (ad: Ad) => void
}

export const AdCard = ({
  ad,
  onEdit,
  onDuplicate,
  onDelete,
  onClickAd,
}: AdCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCardClick = () => {
    onClickAd(ad)
  }

  const handleMenuAction =
    (action: (ad: Ad) => void) => (event: React.MouseEvent) => {
      event.stopPropagation()
      action(ad)
      setMenuOpen(false)
    }

  return (
    <article
      className="ad-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
    >
      <header className="ad-card__header">
        <div>
          <h3 className="ad-card__title">{ad.title}</h3>
          <p className="ad-card__author">{ad.author}</p>
        </div>
        <div className="ad-card__menu" ref={menuRef}>
          <button
            className="action-button"
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            }}
          >
            操作
            <span className="action-button__caret">▾</span>
          </button>
          {menuOpen ? (
            <div className="action-menu">
              <button onClick={handleMenuAction(onEdit)}>编辑广告</button>
              <button onClick={handleMenuAction(onDuplicate)}>复制广告</button>
              <button onClick={handleMenuAction(onDelete)}>删除广告</button>
            </div>
          ) : null}
        </div>
      </header>

      <p className="ad-card__description">{ad.description}</p>

      <footer className="ad-card__footer">
        <div className="ad-card__stat stat--heat">热度：{ad.clicked}</div>
        <div className="ad-card__stat stat--bid">
          出价：{formatCurrency(ad.price)}
        </div>
      </footer>
    </article>
  )
}

