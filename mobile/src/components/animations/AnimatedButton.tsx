import React, { useRef, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, shadows } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  rippleEffect?: boolean;
  elevated?: boolean;
  rounded?: boolean;
  animateOnLoad?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  iconName,
  iconPosition = 'left',
  iconSize = 20,
  iconColor,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  rippleEffect = true,
  elevated = true,
  rounded = false,
  animateOnLoad = false,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(animateOnLoad ? 0.95 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animateOnLoad ? 0 : 1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;

  // Handle animation on component load
  useEffect(() => {
    if (animateOnLoad) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOnLoad]);

  // Press animations
  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Get button styling based on variant and size
  const getButtonStyle = () => {
    // Base styles
    let buttonStyle: ViewStyle = {
      opacity: disabled ? 0.6 : 1,
    };

    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: colors.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: colors.secondary,
        };
        break;
      case 'outline':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        };
        break;
      case 'ghost':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: 'transparent',
        };
        break;
      case 'danger':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: colors.danger,
        };
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
        break;
    }

    // Full width style
    if (fullWidth) {
      buttonStyle = {
        ...buttonStyle,
        alignSelf: 'stretch',
      };
    }

    // Rounded style
    if (rounded) {
      buttonStyle = {
        ...buttonStyle,
        borderRadius: 100,
      };
    } else {
      buttonStyle = {
        ...buttonStyle,
        borderRadius: 8,
      };
    }

    // Elevation style
    if (elevated && variant !== 'ghost' && variant !== 'outline') {
      buttonStyle = {
        ...buttonStyle,
        ...shadows.md,
      };
    }

    return buttonStyle;
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  // Get text size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.fontSize.sm;
      case 'medium':
        return typography.fontSize.md;
      case 'large':
        return typography.fontSize.lg;
      default:
        return typography.fontSize.md;
    }
  };

  // Determine icon color if not explicitly provided
  const getIconColor = () => {
    if (iconColor) return iconColor;
    return getTextColor();
  };

  // Render loading indicator
  const renderLoadingIndicator = () => {
    return (
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'small'}
        color={getTextColor()}
        style={styles.loadingIndicator}
      />
    );
  };

  // Render icon
  const renderIcon = () => {
    if (!iconName) return null;
    
    return (
      <Icon
        name={iconName}
        size={iconSize}
        color={getIconColor()}
        style={[
          styles.icon,
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
        ]}
      />
    );
  };

  // Render content (icon + text)
  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && renderIcon()}
        
        {loading ? (
          renderLoadingIndicator()
        ) : (
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getTextSize(),
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        )}
        
        {iconPosition === 'right' && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonStyle(),
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {rippleEffect && (
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [
                  {
                    scale: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 2],
                    }),
                  },
                ],
                opacity: rippleOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0],
                }),
              },
            ]}
          />
        )}
        
        {renderContent()}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  icon: {
    alignSelf: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  loadingIndicator: {
    marginHorizontal: 8,
  },
});

export default AnimatedButton;