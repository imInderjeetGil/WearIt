export function getSellingPrice(product) {
  return product.discount_price ?? product.price;
}

export function hasDiscount(product) {
  return (
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    Number(product.discount_price) < Number(product.price)
  );
}

export function getSubtotal(product, qty) {
    return getSellingPrice(product) * qty;
}