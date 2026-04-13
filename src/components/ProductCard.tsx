import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CARD_HEIGHT } from '../constants/layout';
import { Product } from '../types/product';
import { formatPrice, formatRating } from '../utils/format';

type ProductCardProps = {
  product: Product;
  onPress?: (product: Product) => void;
  isDragging?: boolean;
};

export function ProductCard({
  product,
  onPress,
  isDragging = false,
}: ProductCardProps) {
  function handlePress() {
    onPress?.(product);
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress ? handlePress : undefined}
      style={({pressed}) => [
        styles.card,
        pressed && !isDragging && styles.cardPressed,
        isDragging && styles.cardDragging,
      ]}>
      <View style={styles.imageShell}>
        <Image
          resizeMode="contain"
          source={{uri: product.image}}
          style={styles.image}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.category}>
            {product.category}
          </Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.rating}>{formatRating(product.rating?.rate)}</Text>
          <Text style={styles.reviews}>
            {product.rating?.count ?? 0} reviews
          </Text>
        </View>
      </View>

      <View style={[styles.dragHandle, isDragging && styles.dragHandleActive]}>
        <View style={styles.dragGrip}>
          <View style={styles.dragLine} />
          <View style={styles.dragLine} />
          <View style={styles.dragLine} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardDragging: {
    borderColor: '#2563eb',
    backgroundColor: '#f8fbff',
  },
  imageShell: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  image: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  category: {
    flexShrink: 1,
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  price: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rating: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  reviews: {
    color: '#6b7280',
    fontSize: 12,
  },
  dragHandle: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  dragHandleActive: {
    opacity: 0.7,
  },
  dragGrip: {
    justifyContent: 'space-between',
    height: 16,
  },
  dragLine: {
    width: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
  },
});
