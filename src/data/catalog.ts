import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product } from '../types/product';
import { applyStoredOrder } from '../utils/order';

export const PRODUCT_ORDER_STORAGE_KEY = '@api-integration/product-order';
export const PRODUCT_API_URL = 'https://fakestoreapi.com/products';

export async function fetchProducts() {
  const response = await fetch(PRODUCT_API_URL);

  if (!response.ok) {
    throw new Error(`Unable to load products. Status: ${response.status}`);
  }

  const products = (await response.json()) as Product[];

  if (!Array.isArray(products)) {
    throw new Error('Unexpected products payload.');
  }

  return products;
}

export async function loadStoredOrder() {
  try {
    const rawValue = await AsyncStorage.getItem(PRODUCT_ORDER_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (value): value is number => typeof value === 'number',
    );
  } catch {
    return [];
  }
}

export async function loadOrderedProducts() {
  const [products, storedOrder] = await Promise.all([
    fetchProducts(),
    loadStoredOrder(),
  ]);

  return applyStoredOrder(products, storedOrder);
}

export async function saveProductOrder(products: Product[]) {
  await AsyncStorage.setItem(
    PRODUCT_ORDER_STORAGE_KEY,
    JSON.stringify(products.map(product => product.id)),
  );
}
