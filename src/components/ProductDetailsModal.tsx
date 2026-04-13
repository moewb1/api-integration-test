import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Product } from '../types/product';
import { formatPrice, formatRating } from '../utils/format';

type ProductDetailsModalProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  if (!product) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.backdrop} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView
            bounces={false}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.imageShell}>
              <Image
                resizeMode="contain"
                source={{uri: product.image}}
                style={styles.image}
              />
            </View>

            <View style={styles.headerRow}>
              <Text numberOfLines={2} style={styles.title}>
                {product.title}
              </Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
            </View>

            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Category</Text>
                <Text style={styles.badgeValue}>{product.category}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Rating</Text>
                <Text style={styles.badgeValue}>
                  {formatRating(product.rating?.rate)}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Reviews</Text>
                <Text style={styles.badgeValue}>
                  {product.rating?.count ?? 0}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#ffffff',
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  imageShell: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  image: {
    width: '74%',
    height: '74%',
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  badge: {
    minWidth: 100,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  badgeLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  badgeValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  description: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#111827',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
