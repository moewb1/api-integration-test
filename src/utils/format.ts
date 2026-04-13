const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatPrice(price: number) {
  return usdFormatter.format(price);
}

export function formatRating(rate?: number) {
  if (typeof rate !== 'number') {
    return 'No rating';
  }

  return `${rate.toFixed(1)} / 5`;
}
