import { applyStoredOrder, moveItem } from '../src/utils/order';
import { Product } from '../src/types/product';

const products: Product[] = [
  {
    id: 1,
    title: 'Backpack',
    price: 109.95,
    description: 'Carry-on backpack',
    category: 'bags',
    image: 'https://example.com/backpack.png',
    rating: {
      rate: 4.7,
      count: 120,
    },
  },
  {
    id: 2,
    title: 'T-Shirt',
    price: 24.99,
    description: 'Soft cotton shirt',
    category: 'fashion',
    image: 'https://example.com/shirt.png',
    rating: {
      rate: 4.3,
      count: 44,
    },
  },
  {
    id: 3,
    title: 'Laptop Sleeve',
    price: 32.5,
    description: 'Protective sleeve',
    category: 'accessories',
    image: 'https://example.com/sleeve.png',
    rating: {
      rate: 4.9,
      count: 71,
    },
  },
];

describe('order helpers', () => {
  it('moves an item to a new index', () => {
    expect(moveItem(products, 0, 2).map(product => product.id)).toEqual([
      2, 3, 1,
    ]);
  });

  it('applies a stored order and keeps new products at the end', () => {
    expect(applyStoredOrder(products, [3, 1, 99]).map(product => product.id))
      .toEqual([3, 1, 2]);
  });
});
