import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Initial cart state - try to load from localStorage
function initializeCart() {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], initializeCart);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if product already exists in cart
      const existingItemIndex = state.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex >= 0) {
        // Product already in cart - update its quantity
        return state.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        // New product - add to cart
        return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
    }
    
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    
    case 'CLEAR_CART':
      return [];
    
    default:
      return state;
  }
}
