import { useMemo, useState } from 'react'
import { CartContext } from './CartContext'

function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addToCart = (product, size, color) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color,
      )

      if (existingIndex >= 0) {
        return currentItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, { product, size, color, quantity: 1 }]
    })
  }

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return

    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity } : item,
      ),
    )
  }

  const removeItem = (index) => {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeItem,
      cartCount,
      totalPrice,
    }),
    [items, cartCount, totalPrice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartProvider
