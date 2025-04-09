import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type LoadingType = 'spinner' | 'pulse' | 'dots' | 'success' | 'error' | 'card' | 'transaction';

interface LoadingAnimationProps {
  type?: LoadingType;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  messageStyle?: TextStyle;
  style?: ViewStyle;
  showIcon?: boolean;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  iconAnimated?: boolean;
  duration?: number;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'medium',
  color = colors.primary,
  message,
  messageStyle,
  style,
  showIcon = false,
  iconName,
  iconSize,
  iconColor,
  iconAnimated = true,
  duration = 1500,
}) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  // Calculate size based on the size prop
  const getSize = () => {
    switch (size) {
      case 'small':
        return 30;
      case 'medium':
        return 50;
      case 'large':
        return 80;
      default:
        return 50;
    }
  };

  // Get icon size based on the size prop
  const getIconSize = () => {
    if (iconSize) return iconSize;
    
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 30;
      case 'large':
        return 50;
      default:
        return 30;
    }
  };

  // Get icon name based on the type
  const getIconName = () => {
    if (iconName) return iconName;
    
    switch (type) {
      case 'spinner':
        return 'loading';
      case 'card':
        return 'credit-card-outline';
      case 'transaction':
        return 'bank-transfer';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'loading';
    }
  };

  // Setup animation loops
  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    switch (type) {
      case 'spinner':
        // Rotation animation for spinner
        animation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        break;
      case 'pulse':
        // Pulsing animation
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'dots':
        // Sequential dots animation
        animation = Animated.loop(
          Animated.stagger(duration / 6, [
            Animated.sequence([
              Animated.timing(dot1Anim, {
                toValue: 1,
                duration: duration / 3,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot1Anim, {
                toValue: 0,
                duration: duration / 3,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(dot2Anim, {
                toValue: 1,
                duration: duration / 3,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot2Anim, {
                toValue: 0,
                duration: duration / 3,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(dot3Anim, {
                toValue: 1,
                duration: duration / 3,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot3Anim, {
                toValue: 0,
                duration: duration / 3,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        break;
      case 'card':
        // Card loading animation
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(cardAnim, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(cardAnim, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'success':
        // Success animation (single shot)
        animation = Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: duration / 4,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration / 4,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
        break;
      case 'error':
        // Error animation (single shot with shake)
        animation = Animated.sequence([
          Animated.timing(errorAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 0.1,
              duration: 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -0.1,
              duration: 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0.1,
              duration: 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]);
        break;
      case 'transaction':
        // Transaction loading animation
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: duration / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: duration / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      default:
        // Default spinner
        animation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
    }

    // Start the animation
    animation.start();

    // Clean up animation on unmount
    return () => {
      animation.stop();
    };
  }, [type, duration]);

  // Render dots loading animation
  const renderDots = () => {
    const calculatedSize = getSize() / 3;
    
    return (
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              width: calculatedSize,
              height: calculatedSize,
              backgroundColor: color,
              opacity: dot1Anim,
              transform: [
                {
                  scale: dot1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: calculatedSize,
              height: calculatedSize,
              backgroundColor: color,
              opacity: dot2Anim,
              transform: [
                {
                  scale: dot2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: calculatedSize,
              height: calculatedSize,
              backgroundColor: color,
              opacity: dot3Anim,
              transform: [
                {
                  scale: dot3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  };

  // Render icon with animation
  const renderIcon = () => {
    if (!showIcon && type !== 'success' && type !== 'error') return null;

    // Determine icon properties
    const finalIconName = getIconName();
    const finalIconSize = getIconSize();
    const finalIconColor = iconColor || color;

    // Determine animation transform based on type
    let transform: any[] = [{ scale: scaleAnim }];

    if (type === 'spinner' && iconAnimated) {
      transform = [
        {
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
        { scale: scaleAnim },
      ];
    } else if (type === 'error') {
      transform = [
        {
          rotate: rotateAnim.interpolate({
            inputRange: [-0.1, 0, 0.1],
            outputRange: ['-10deg', '0deg', '10deg'],
          }),
        },
        { scale: scaleAnim },
      ];
    } else if (type === 'card') {
      transform = [
        {
          translateY: cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -10],
          }),
        },
        { scale: scaleAnim },
      ];
    } else if (type === 'transaction') {
      transform = [
        {
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['-20deg', '20deg'],
          }),
        },
        { scale: scaleAnim },
      ];
    }

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity:
              type === 'success'
                ? successAnim
                : type === 'error'
                ? errorAnim
                : 1,
            transform,
          },
        ]}
      >
        <Icon name={finalIconName} size={finalIconSize} color={finalIconColor} />
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {type === 'dots' ? (
        renderDots()
      ) : (
        renderIcon()
      )}
      
      {message && (
        <Text
          style={[
            styles.message,
            { color: color },
            messageStyle,
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 100,
    margin: 5,
  },
  message: {
    marginTop: 16,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default LoadingAnimation;