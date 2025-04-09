import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors, shadows } from '../../utils/theme';
import PaymentCard from '../wallet/PaymentCard';
import { CardType, CardStyle } from '../wallet/PaymentCard';

interface AnimatedCardProps {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cardType: CardType;
  isDefault?: boolean;
  balance?: number;
  cardStyle?: CardStyle;
  gradientColors?: string[];
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
  isActive?: boolean;
  style?: ViewStyle;
  animationType?: 'pulse' | 'flip' | 'slide' | 'bounce' | 'none';
  entryAnimation?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  id,
  cardHolder,
  cardNumber,
  expiryDate,
  cardType,
  isDefault = false,
  balance,
  cardStyle,
  gradientColors,
  onPress,
  onLongPress,
  isActive = false,
  style,
  animationType = 'none',
  entryAnimation = true,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(entryAnimation ? 0.95 : 1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(entryAnimation ? 50 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(entryAnimation ? 0 : 1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Handle entry animation
  useEffect(() => {
    if (entryAnimation) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [entryAnimation]);

  // Handle animation based on animationType
  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;

    switch (animationType) {
      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'flip':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'bounce':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      default:
        break;
    }

    if (animation) {
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [animationType]);

  // Handle active state
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1.05 : 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [isActive]);

  // Create transform style based on animation type
  const getTransformStyle = () => {
    const transform: any[] = [
      { scale: scaleAnim },
      { translateY: translateYAnim },
    ];

    if (animationType === 'pulse') {
      transform.push({ scale: pulseAnim });
    }

    if (animationType === 'flip') {
      transform.push({
        rotateY: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      });
    }

    if (animationType === 'bounce') {
      transform.push({ translateY: bounceAnim });
    }

    return { transform };
  };

  // Handle press animation
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1.05 : 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(id);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <Animated.View
        style={[
          styles.container,
          style,
          getTransformStyle(),
          { opacity: opacityAnim },
          Platform.OS === 'ios' && styles.iosShadow,
        ]}
      >
        <PaymentCard
          id={id}
          cardHolder={cardHolder}
          cardNumber={cardNumber}
          expiryDate={expiryDate}
          cardType={cardType}
          isDefault={isDefault}
          balance={balance}
          cardStyle={cardStyle}
          gradientColors={gradientColors}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    ...shadows.lg,
    margin: 8,
  },
  iosShadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});

export default AnimatedCard;