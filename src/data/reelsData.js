/**
 * Reels Data — Loads from backend API, falls back to sample data.
 */

const sampleReels = [
  {
    id: 'sample-1',
    videoUrl: 'https://videos.pexels.com/video-files/5705370/5705370-uhd_1440_2560_25fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
    productName: 'Summer Floral Dress',
    productPrice: 3299,
    productId: null,
    username: '@tarikclothing',
    caption: 'Summer vibes with our new floral dress collection 🌸✨ #TarikStyle',
    likes: 1243,
    comments: 89,
    shares: 234,
  },
  {
    id: 'sample-2',
    videoUrl: 'https://videos.pexels.com/video-files/6567907/6567907-uhd_1440_2560_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
    productName: 'Premium Leather Jacket',
    productPrice: 4999,
    productId: null,
    username: '@tarikclothing',
    caption: 'The jacket that turns heads 🔥 Premium leather, unmatched style #LeatherVibes',
    likes: 2891,
    comments: 156,
    shares: 412,
  },
  {
    id: 'sample-3',
    videoUrl: 'https://videos.pexels.com/video-files/5538327/5538327-uhd_1440_2560_25fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
    productName: 'Classic Denim Collection',
    productPrice: 2499,
    productId: null,
    username: '@tarikclothing',
    caption: 'Denim that fits like a dream 👖 New collection just dropped! #DenimLove',
    likes: 3456,
    comments: 201,
    shares: 567,
  },
  {
    id: 'sample-4',
    videoUrl: 'https://videos.pexels.com/video-files/5976617/5976617-uhd_1440_2560_25fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
    productName: 'Silk Blend Blazer',
    productPrice: 5999,
    productId: null,
    username: '@tarikclothing',
    caption: 'Elegance redefined ✨ Our silk blazer is a showstopper #BlazerSeason',
    likes: 1876,
    comments: 134,
    shares: 321,
  },
  {
    id: 'sample-5',
    videoUrl: 'https://videos.pexels.com/video-files/4926002/4926002-uhd_1440_2560_25fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80',
    productName: 'Oversized Graphic Tee',
    productPrice: 1299,
    productId: null,
    username: '@tarikclothing',
    caption: 'Streetwear essentials 🖤 Oversized fit, premium comfort #StreetStyle',
    likes: 4521,
    comments: 278,
    shares: 890,
  },
  {
    id: 'sample-6',
    videoUrl: 'https://videos.pexels.com/video-files/6252728/6252728-uhd_1440_2560_25fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&q=80',
    productName: 'Cropped Hoodie',
    productPrice: 1799,
    productId: null,
    username: '@tarikclothing',
    caption: 'Cozy meets cool 🧥 The perfect cropped hoodie for every mood #HoodieLife',
    likes: 2134,
    comments: 167,
    shares: 445,
  },
]

export { sampleReels }

/**
 * Fetch reels from backend API and merge with sample reels.
 * Admin reels appear first.
 */
export async function fetchReels(apiFetch) {
  try {
    const data = await apiFetch('/api/reels')
    const adminReels = data.reels || []
    if (adminReels.length > 0) {
      return [...adminReels, ...sampleReels]
    }
    return sampleReels
  } catch {
    return sampleReels
  }
}

// Default export for backward compatibility (sample reels only)
export default sampleReels
