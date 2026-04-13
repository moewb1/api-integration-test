import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '../components/ProductCard';
// Dynamic paths
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import {
  AUTO_SCROLL_EDGE,
  AUTO_SCROLL_STEP,
  CARD_GAP,
  CARD_HEIGHT,
  ROW_HEIGHT,
} from '../constants/layout';
import { loadOrderedProducts, saveProductOrder } from '../data/catalog';
import { Product } from '../types/product';
import { clamp, moveItem } from '../utils/order';

type DragSession = {
  product: Product;
  startIndex: number;
  targetIndex: number;
};

export function ProductCatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dragState, setDragState] = useState<DragSession | null>(null);
  const [listHeight, setListHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const dragOriginTop = useRef(0);
  const dragTop = useRef(new Animated.Value(0)).current;
  const dragSessionRef = useRef<DragSession | null>(null);
  const lastDragReleaseAt = useRef(0);

  useEffect(() => {
    hydrateProducts().catch(() => undefined);
  }, []);

  async function hydrateProducts() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextProducts = await loadOrderedProducts();
      setProducts(nextProducts);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while loading the catalog.';

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function persistProductOrder(nextProducts: Product[]) {
    setProducts(nextProducts);

    try {
      await saveProductOrder(nextProducts);
    } catch {
      setErrorMessage('The list moved, but the new order could not be saved.');
    }
  }

  function syncDragSession(nextSession: DragSession | null) {
    dragSessionRef.current = nextSession;
    setDragState(nextSession);
  }

  function scrollBy(distance: number) {
    if (listHeight <= 0) {
      return;
    }

    const contentHeight = products.length * ROW_HEIGHT;
    const maxOffset = Math.max(contentHeight - listHeight, 0);
    const nextOffset = clamp(scrollOffset.current + distance, 0, maxOffset);

    if (nextOffset === scrollOffset.current) {
      return;
    }

    scrollOffset.current = nextOffset;
    scrollViewRef.current?.scrollTo({animated: false, y: nextOffset});
  }

  function beginDrag(product: Product, index: number) {
    const nextSession = {
      product,
      startIndex: index,
      targetIndex: index,
    };

    dragOriginTop.current = index * ROW_HEIGHT - scrollOffset.current;
    dragTop.setValue(dragOriginTop.current);
    syncDragSession(nextSession);
  }

  function handleDragMove(gestureDy: number) {
    const activeDrag = dragSessionRef.current;

    if (!activeDrag) {
      return;
    }

    const minTop = -scrollOffset.current;
    const maxTop =
      Math.max(products.length * ROW_HEIGHT - ROW_HEIGHT, 0) -
      scrollOffset.current;
    const nextTop = clamp(dragOriginTop.current + gestureDy, minTop, maxTop);

    dragTop.setValue(nextTop);

    if (listHeight > 0) {
      if (nextTop < AUTO_SCROLL_EDGE) {
        scrollBy(-AUTO_SCROLL_STEP);
      } else if (nextTop + CARD_HEIGHT > listHeight - AUTO_SCROLL_EDGE) {
        scrollBy(AUTO_SCROLL_STEP);
      }
    }

    const nextIndex = clamp(
      Math.floor((nextTop + scrollOffset.current + ROW_HEIGHT / 2) / ROW_HEIGHT),
      0,
      products.length - 1,
    );

    if (nextIndex !== activeDrag.targetIndex) {
      syncDragSession({
        ...activeDrag,
        targetIndex: nextIndex,
      });
    }
  }

  async function finishDrag() {
    const activeDrag = dragSessionRef.current;

    if (!activeDrag) {
      return;
    }

    lastDragReleaseAt.current = Date.now();
    syncDragSession(null);

    if (activeDrag.startIndex === activeDrag.targetIndex) {
      return;
    }

    const nextProducts = moveItem(
      products,
      activeDrag.startIndex,
      activeDrag.targetIndex,
    );

    await persistProductOrder(nextProducts);
  }

  function buildHandleResponder(product: Product, index: number) {
    const shouldCaptureMove = (
      dx: number,
      dy: number,
    ) => dragSessionRef.current === null &&
      Math.abs(dy) > 8 &&
      Math.abs(dy) > Math.abs(dx);

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        shouldCaptureMove(gestureState.dx, gestureState.dy),
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        shouldCaptureMove(gestureState.dx, gestureState.dy),
      onPanResponderGrant: () => beginDrag(product, index),
      onPanResponderMove: (_, gestureState) => {
        handleDragMove(gestureState.dy);
      },
      onPanResponderRelease: () => {
        finishDrag().catch(() => undefined);
      },
      onPanResponderTerminate: () => {
        finishDrag().catch(() => undefined);
      },
      onPanResponderTerminationRequest: () => false,
    });
  }

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View style={styles.centerState}>
        <ActivityIndicator color="#1f2d1d" size="large" />
        <Text style={styles.stateTitle}>Loading products</Text>
        <Text style={styles.stateText}>
          Pulling the latest catalog from the API.
        </Text>
      </View>
    );
  } else if (products.length === 0) {
    content = (
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>
          {errorMessage ? 'Unable to load products' : 'No products found'}
        </Text>
        <Text style={styles.stateText}>
          {errorMessage ?? 'The API responded with an empty list.'}
        </Text>
        <Pressable
          onPress={() => {
            hydrateProducts().catch(() => undefined);
          }}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.listContent}
          onScroll={event => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          {products.map(item => {
            const actualIndex = products.findIndex(
              product => product.id === item.id,
            );
            const handleResponder = buildHandleResponder(item, actualIndex);
            const isDraggedItem = dragState?.product.id === item.id;

            return (
              <View
                key={item.id}
                collapsable={false}
                style={styles.row}
                {...handleResponder.panHandlers}>
                {isDraggedItem ? (
                  <View style={[styles.placeholder, styles.sourcePlaceholder]} />
                ) : (
                  <ProductCard
                    onPress={() => {
                      if (Date.now() - lastDragReleaseAt.current < 250) {
                        return;
                      }

                      if (!dragSessionRef.current) {
                        setSelectedProduct(item);
                      }
                    }}
                    product={item}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        {dragState ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dragOverlay,
              {
                transform: [{translateY: dragTop}],
              },
            ]}>
            <View style={styles.row}>
              <ProductCard isDragging product={dragState.product} />
            </View>
          </Animated.View>
        ) : null}
      </>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Products</Text>
        </View>

        {errorMessage && products.length > 0 ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View
          onLayout={event => {
            setListHeight(event.nativeEvent.layout.height);
          }}
          style={styles.listShell}>
          {content}
        </View>
      </View>

      <ProductDetailsModal
        onClose={() => {
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 20,
  },
  listShell: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    height: ROW_HEIGHT,
    paddingBottom: CARD_GAP,
  },
  placeholder: {
    height: CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  sourcePlaceholder: {
    opacity: 1,
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  stateText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    height: 44,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
