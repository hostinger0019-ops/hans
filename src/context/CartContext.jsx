import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('tarik_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('tarik_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, selectedSize, selectedColor, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(
        item => item.id === product.id && item.size === selectedSize && item.color === selectedColor
      )
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.size === selectedSize && item.color === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice || product.originalPrice,
        image: product.images ? product.images[0] : product.image,
        size: selectedSize,
        color: selectedColor,
        quantity,
      }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id, size, color) => {
    setCartItems(prev => prev.filter(
      item => !(item.id === id && item.size === size && item.color === color)
    ))
  }

  const updateQuantity = (id, size, color, quantity) => {
    if (quantity < 1) return removeFromCart(id, size, color)
    setCartItems(prev => prev.map(item =>
      item.id === id && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    ))
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartSubtotal,
      isCartOpen, setIsCartOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export default CartContext
