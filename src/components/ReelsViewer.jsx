import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Heart,
  ShoppingBag,
  Share2,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MessageCircle,
  Bookmark,
  ArrowRight,
} from 'lucide-react'
import './ReelsViewer.css'

const ReelsViewer = ({ reels, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [likedReels, setLikedReels] = useState(new Set())
  const [savedReels, setSavedReels] = useState(new Set())
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [doubleTapAnim, setDoubleTapAnim] = useState(null)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const lastTap = useRef(0)

  const currentReel = reels[currentIndex]

  /* ─── Navigation ─── */
  const goToReel = useCallback((index) => {
    if (index < 0 || index >= reels.length || isTransitioning) return
    setIsTransitioning(true)
    setProgress(0)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsPlaying(true)
      setIsTransitioning(false)
    }, 300)
  }, [reels.length, isTransitioning])

  const nextReel = useCallback(() => goToReel(currentIndex + 1), [currentIndex, goToReel])
  const prevReel = useCallback(() => goToReel(currentIndex - 1), [currentIndex, goToReel])

  /* ─── Keyboard Navigation ─── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          nextReel()
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          prevReel()
          break
        case 'Escape':
          onClose()
          break
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'm':
          setIsMuted(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [nextReel, prevReel, onClose])

  /* ─── Mouse Wheel Navigation ─── */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let wheelTimeout = null
    const handleWheel = (e) => {
      e.preventDefault()
      if (wheelTimeout) return
      wheelTimeout = setTimeout(() => { wheelTimeout = null }, 800)
      if (e.deltaY > 30) nextReel()
      else if (e.deltaY < -30) prevReel()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [nextReel, prevReel])

  /* ─── Touch Swipe ─── */
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(deltaY) > 60) {
      if (deltaY > 0) nextReel()
      else prevReel()
    }
  }

  /* ─── Video Controls ─── */
  const togglePlayPause = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  /* ─── Video Progress ─── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    const handleEnded = () => {
      if (currentIndex < reels.length - 1) {
        nextReel()
      } else {
        video.currentTime = 0
        video.play()
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [currentIndex, reels.length, nextReel])

  /* ─── Auto-play on index change ─── */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.muted = isMuted
      const playPromise = videoRef.current.play()
      if (playPromise) playPromise.catch(() => {})
      setIsPlaying(true)
    }
  }, [currentIndex])

  /* ─── Double Tap to Like ─── */
  const handleVideoClick = (e) => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // Double tap
      toggleLike()
      setDoubleTapAnim({ x: e.clientX, y: e.clientY })
      setTimeout(() => setDoubleTapAnim(null), 800)
    } else {
      // Single tap — toggle play/pause
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 300) {
          togglePlayPause()
        }
      }, 300)
    }
    lastTap.current = now
  }

  /* ─── Interactions ─── */
  const toggleLike = () => {
    setLikedReels(prev => {
      const next = new Set(prev)
      if (next.has(currentReel.id)) next.delete(currentReel.id)
      else next.add(currentReel.id)
      return next
    })
  }

  const toggleSave = () => {
    setSavedReels(prev => {
      const next = new Set(prev)
      if (next.has(currentReel.id)) next.delete(currentReel.id)
      else next.add(currentReel.id)
      return next
    })
  }

  const isLiked = likedReels.has(currentReel.id)
  const isSaved = savedReels.has(currentReel.id)

  const formatCount = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div
      className={`reels-viewer ${isTransitioning ? 'reels-viewer--transitioning' : ''}`}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="reels-viewer"
    >
      {/* Backdrop */}
      <div className="reels-viewer__backdrop" onClick={onClose}></div>

      {/* Close Button */}
      <button className="reels-viewer__close" onClick={onClose} aria-label="Close reels" id="reels-close">
        <X size={24} />
      </button>

      {/* Reel Counter */}
      <div className="reels-viewer__counter">
        {currentIndex + 1} / {reels.length}
      </div>

      {/* Main Reel Container */}
      <div className="reels-viewer__main">
        {/* Video */}
        <div className="reels-viewer__video-wrap" onClick={handleVideoClick}>
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            className="reels-viewer__video"
            loop
            muted={isMuted}
            playsInline
            preload="auto"
          />

          {/* Pause Indicator */}
          {!isPlaying && (
            <div className="reels-viewer__pause-indicator">
              <Play size={48} fill="white" />
            </div>
          )}

          {/* Double Tap Like Animation */}
          {doubleTapAnim && (
            <div
              className="reels-viewer__double-tap-heart"
              style={{ left: doubleTapAnim.x, top: doubleTapAnim.y }}
            >
              <Heart size={80} fill="#e74c3c" stroke="none" />
            </div>
          )}

          {/* Progress Bar */}
          <div className="reels-viewer__progress">
            <div className="reels-viewer__progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Bottom Gradient */}
          <div className="reels-viewer__bottom-gradient"></div>

          {/* Bottom Info */}
          <div className="reels-viewer__info">
            <div className="reels-viewer__user">
              <div className="reels-viewer__avatar">TC</div>
              <span className="reels-viewer__username">{currentReel.username}</span>
              <button className="reels-viewer__follow-btn">Follow</button>
            </div>
            <p className="reels-viewer__caption">{currentReel.caption}</p>

            {/* Product Tag */}
            <div className="reels-viewer__product-tag" id="reel-product-tag">
              <div className="reels-viewer__product-info">
                <ShoppingBag size={16} />
                <div>
                  <span className="reels-viewer__product-name">{currentReel.productName}</span>
                  <span className="reels-viewer__product-price">₹{currentReel.productPrice?.toLocaleString?.() || currentReel.productPrice}</span>
                </div>
              </div>
              <a
                href={currentReel.productId ? `/product/${currentReel.productId}` : '#'}
                className="reels-viewer__shop-btn"
                id="reel-shop-now"
                onClick={(e) => {
                  if (currentReel.productId) {
                    onClose()
                  }
                }}
              >
                Shop Now <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Side Actions */}
        <div className="reels-viewer__actions">
          {/* Like */}
          <button
            className={`reels-viewer__action-btn ${isLiked ? 'reels-viewer__action-btn--liked' : ''}`}
            onClick={toggleLike}
            aria-label="Like"
            id="reel-like-btn"
          >
            <Heart size={26} fill={isLiked ? '#e74c3c' : 'none'} stroke={isLiked ? '#e74c3c' : 'currentColor'} />
            <span>{formatCount(currentReel.likes + (isLiked ? 1 : 0))}</span>
          </button>

          {/* Comment */}
          <button className="reels-viewer__action-btn" aria-label="Comment" id="reel-comment-btn">
            <MessageCircle size={26} />
            <span>{formatCount(currentReel.comments)}</span>
          </button>

          {/* Share */}
          <button
            className="reels-viewer__action-btn"
            onClick={() => setShowShareMenu(!showShareMenu)}
            aria-label="Share"
            id="reel-share-btn"
          >
            <Share2 size={26} />
            <span>{formatCount(currentReel.shares)}</span>
          </button>

          {/* Save */}
          <button
            className={`reels-viewer__action-btn ${isSaved ? 'reels-viewer__action-btn--saved' : ''}`}
            onClick={toggleSave}
            aria-label="Save"
            id="reel-save-btn"
          >
            <Bookmark size={26} fill={isSaved ? '#c9a96e' : 'none'} stroke={isSaved ? '#c9a96e' : 'currentColor'} />
          </button>

          {/* Mute/Unmute */}
          <button
            className="reels-viewer__action-btn"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            id="reel-mute-btn"
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          {/* Navigation */}
          <div className="reels-viewer__nav-arrows">
            <button
              className="reels-viewer__nav-btn"
              onClick={prevReel}
              disabled={currentIndex === 0}
              aria-label="Previous reel"
            >
              <ChevronUp size={22} />
            </button>
            <button
              className="reels-viewer__nav-btn"
              onClick={nextReel}
              disabled={currentIndex === reels.length - 1}
              aria-label="Next reel"
            >
              <ChevronDown size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="reels-viewer__share-menu" id="reel-share-menu">
          <div className="reels-viewer__share-overlay" onClick={() => setShowShareMenu(false)}></div>
          <div className="reels-viewer__share-panel">
            <h3>Share to</h3>
            <div className="reels-viewer__share-options">
              <button className="reels-viewer__share-option" onClick={() => { navigator.clipboard?.writeText(window.location.href); setShowShareMenu(false) }}>
                <span className="share-icon">🔗</span>
                <span>Copy Link</span>
              </button>
              <button className="reels-viewer__share-option">
                <span className="share-icon">💬</span>
                <span>WhatsApp</span>
              </button>
              <button className="reels-viewer__share-option">
                <span className="share-icon">📘</span>
                <span>Facebook</span>
              </button>
              <button className="reels-viewer__share-option">
                <span className="share-icon">🐦</span>
                <span>Twitter</span>
              </button>
            </div>
            <button className="reels-viewer__share-cancel" onClick={() => setShowShareMenu(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReelsViewer
