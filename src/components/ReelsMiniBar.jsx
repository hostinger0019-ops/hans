import { useRef } from 'react'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import './ReelsMiniBar.css'

const ReelsMiniBar = ({ reels, onReelClick }) => {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="reels-mini" id="reels-mini-bar">
      <div className="reels-mini__header container">
        <div className="reels-mini__title-wrap">
          <div className="reels-mini__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="4" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="10" y1="2" x2="10" y2="10" />
              <polygon points="14 15 18 18 14 21" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h2 className="reels-mini__title">Reels</h2>
          <span className="reels-mini__badge">NEW</span>
        </div>
        <div className="reels-mini__arrows">
          <button className="reels-mini__arrow" onClick={() => scroll('left')} aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button className="reels-mini__arrow" onClick={() => scroll('right')} aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="reels-mini__track" ref={scrollRef}>
        {reels.map((reel, index) => {
          const isVideoThumb = reel.thumbnail && /\.(mp4|mov|webm)(\?|$)/i.test(reel.thumbnail)

          return (
            <button
              key={reel.id}
              className="reels-mini__item"
              onClick={() => onReelClick(index)}
              aria-label={`Play reel: ${reel.productName}`}
              id={`reel-thumb-${reel.id}`}
            >
              <div className="reels-mini__ring">
                <div className="reels-mini__thumb">
                  {isVideoThumb ? (
                    <video
                      src={reel.thumbnail + '#t=0.5'}
                      muted
                      playsInline
                      preload="auto"
                      onLoadedMetadata={(e) => { e.target.currentTime = 0.5 }}
                      onSeeked={(e) => { e.target.pause() }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={reel.thumbnail} alt={reel.productName} loading="lazy" />
                  )}
                  <div className="reels-mini__play-overlay">
                    <Play size={20} fill="white" />
                  </div>
                  <div className="reels-mini__gradient"></div>
                  <span className="reels-mini__product-name">{reel.productName}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ReelsMiniBar
