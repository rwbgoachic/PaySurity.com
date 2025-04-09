import React, { useRef, useEffect, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  ViewStyle,
} from 'react-native';
import { colors } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

type TransitionType = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoom' | 'none';

interface ScreenTransitionProps {
  children: ReactNode;
  style?: ViewStyle;
  transitionType?: TransitionType;
  duration?: number;
  delay?: number;
  visible?: boolean;
  onAnimationComplete?: () => void;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  style,
  transitionType = 'fade',
  duration = 300,
  delay = 0,
  visible = true,
  onAnimationComplete,
}) => {
  const opacity = useRef(new Animated.Value(visible ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(transitionType === 'slideUp' ? height : transitionType === 'slideDown' ? -height : 0)).current;
  const translateX = useRef(new Animated.Value(transitionType === 'slideLeft' ? width : transitionType === 'slideRight' ? -width : 0)).current;
  const scale = useRef(new Animated.Value(transitionType === 'zoom' ? 0.8 : 1)).current;

  useEffect(() => {
    if (visible) {
      const animations = [];

      // Configure animations based on transition type
      if (transitionType === 'fade' || transitionType === 'zoom') {
        animations.push(
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          })
        );
      }

      if (transitionType === 'slideUp' || transitionType === 'slideDown') {
        animations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          })
        );
      }

      if (transitionType === 'slideLeft' || transitionType === 'slideRight') {
        animations.push(
          Animated.timing(translateX, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          })
        );
      }

      if (transitionType === 'zoom') {
        animations.push(
          Animated.timing(scale, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          })
        );
      }

      // Play all animations in parallel
      Animated.parallel(animations).start(({ finished }) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
    } else {
      const animations = [];

      // Configure animations for exit
      if (transitionType === 'fade' || transitionType === 'zoom') {
        animations.push(
          Animated.timing(opacity, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          })
        );
      }

      if (transitionType === 'slideUp') {
        animations.push(
          Animated.timing(translateY, {
            toValue: -height,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          })
        );
      }

      if (transitionType === 'slideDown') {
        animations.push(
          Animated.timing(translateY, {
            toValue: height,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          })
        );
      }

      if (transitionType === 'slideLeft') {
        animations.push(
          Animated.timing(translateX, {
            toValue: -width,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          })
        );
      }

      if (transitionType === 'slideRight') {
        animations.push(
          Animated.timing(translateX, {
            toValue: width,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          })
        );
      }

      if (transitionType === 'zoom') {
        animations.push(
          Animated.timing(scale, {
            toValue: 0.8,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          })
        );
      }

      // Play all animations in parallel
      Animated.parallel(animations).start(({ finished }) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [visible, transitionType, duration, delay]);

  // Get animation style
  const getAnimationStyle = () => {
    const style: any = {
      opacity: transitionType === 'none' ? 1 : opacity,
    };

    if (transitionType === 'slideUp' || transitionType === 'slideDown') {
      style.transform = [{ translateY }];
    }

    if (transitionType === 'slideLeft' || transitionType === 'slideRight') {
      style.transform = [{ translateX }];
    }

    if (transitionType === 'zoom') {
      style.transform = [{ scale }];
    }

    return style;
  };

  return (
    <Animated.View style={[styles.container, style, getAnimationStyle()]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ScreenTransition;