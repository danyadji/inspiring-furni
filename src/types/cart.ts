export interface CartItem {
  productId: number;
  productSlug: string;
  productName: string;
  variationId: number;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
  imageSrc: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number, variationId: number) => void;
  updateQuantity: (productId: number, variationId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalCount: number;
  isLoaded: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}
