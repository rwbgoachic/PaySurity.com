import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  FlatList,
  Easing,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { Transaction } from '../../hooks/useWallet';

interface AnimatedTransactionsListProps {
  transactions: Transaction[];
  renderItem: ListRenderItem<Transaction>;
  keyExtractor?: (item: Transaction) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  animationDelay?: number;
  animationDuration?: number;
  animationType?: 'fade' | 'slide' | 'scale' | 'none';
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

const AnimatedTransactionsList: React.FC<AnimatedTransactionsListProps> = ({
  transactions,
  renderItem,
  keyExtractor = (item) => item.id,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  contentContainerStyle,
  style,
  animationDelay = 50,
  animationDuration = 300,
  animationType = 'fade',
  refreshing,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.2,
}) => {
  // Animation reference for list item appearance
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  // Initialize animated values for each transaction
  useEffect(() => {
    transactions.forEach((item) => {
      if (!animatedValues.current[item.id]) {
        animatedValues.current[item.id] = new Animated.Value(0);
      }
    });
  }, [transactions]);

  // Animation configuration for list items
  const getAnimationConfig = (itemId: string, index: number) => {
    return {
      opacity: animationType === 'none' ? 1 : animatedValues.current[itemId],
      transform: [
        {
          translateY: animationType === 'slide'
            ? animatedValues.current[itemId].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            : 0,
        },
        {
          scale: animationType === 'scale'
            ? animatedValues.current[itemId].interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            : 1,
        },
      ],
    };
  };

  // Animate items when list changes
  useEffect(() => {
    const animations = transactions.map((item, index) => {
      return Animated.timing(animatedValues.current[item.id], {
        toValue: 1,
        duration: animationDuration,
        delay: index * animationDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      });
    });

    Animated.stagger(animationDelay, animations).start();
  }, [transactions, animationDelay, animationDuration]);

  // Custom render item with animation
  const renderAnimatedItem: ListRenderItem<Transaction> = ({ item, index }) => {
    const animatedStyle = getAnimationConfig(item.id, index);

    return (
      <Animated.View style={[styles.animatedItem, animatedStyle]}>
        {renderItem({ item, index })}
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderAnimatedItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={contentContainerStyle}
      style={[styles.list, style]}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  animatedItem: {
    // The base style for the animated item container
  },
});

export default AnimatedTransactionsList;