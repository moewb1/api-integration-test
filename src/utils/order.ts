import { Product } from '../types/product';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, item);

  return nextItems;
}

export function applyStoredOrder(products: Product[], orderedIds: number[]) {
  if (orderedIds.length === 0) {
    return products;
  }

  const remainingProducts = new Map(
    products.map(product => [product.id, product]),
  );
  const orderedProducts: Product[] = [];

  orderedIds.forEach(productId => {
    const product = remainingProducts.get(productId);

    if (product) {
      orderedProducts.push(product);
      remainingProducts.delete(productId);
    }
  });

  products.forEach(product => {
    if (remainingProducts.has(product.id)) {
      orderedProducts.push(product);
    }
  });

  return orderedProducts;
}

export function insertPlaceholder<T>(items: T[], index: number) {
  const nextItems: Array<T | null> = [...items];

  nextItems.splice(clamp(index, 0, items.length), 0, null);

  return nextItems;
}
