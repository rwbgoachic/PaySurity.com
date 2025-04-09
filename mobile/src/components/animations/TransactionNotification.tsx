import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { colors, typography, shadows } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const NOTIFICATION_HEIGHT = 80;
const NOTIFICATION_WIDTH = width - 32;

interface TransactionNotificationProps {
  visible: boolean;
  type: 'success' | 'pending' | 'failed' | 'info';
  title: string;
  message: string;
  amount?: number;
  showAmount?: boolean;
  icon?: string;
  image?: string;
  onPress?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  hideAfter?: number; // in milliseconds
  preventDismiss?: boolean;
  position?: 'top' | 'bottom';
}

const TransactionNotification: React.FC<TransactionNotificationProps> = ({
  visible,
  type,
  title,
  message,
  amount,
  showAmount = true,
  icon,
  image,
  onPress,
  onDismiss,
  autoHide = true,
  hideAfter = 4000,
  preventDismiss = false,
  position = 'top',
}) => {
  // Animation values
  const translateY = useRef(new Animated.Value(position === 'top' ? -NOTIFICATION_HEIGHT - 20 : NOTIFICATION_HEIGHT + 20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  
  // Hide timeout
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if notification was dismissed
  const [dismissed, setDismissed] = useState(false);

  // Show/hide animation based on visibility prop
  useEffect(() => {
    if (visible && !dismissed) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after specified duration
      if (autoHide && !preventDismiss) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, hideAfter);
      }
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -NOTIFICATION_HEIGHT - 20 : NOTIFICATION_HEIGHT + 20,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        // Reset dismissed state after animation completes
        setDismissed(false);
      });
    }

    // Clean up timeout on unmount
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [visible, dismissed]);

  // Handler for press on notification
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    
    if (!preventDismiss) {
      handleDismiss();
    }
  };

  // Handler for dismissing the notification
  const handleDismiss = () => {
    if (preventDismiss) return;
    
    setDismissed(true);
    
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Call onDismiss callback after animation
    if (onDismiss) {
      setTimeout(onDismiss, 300);
    }
  };

  // Get styles based on notification type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: `${colors.success}10`,
          borderColor: colors.success,
          iconName: icon || 'check-circle',
          iconColor: colors.success,
        };
      case 'pending':
        return {
          backgroundColor: `${colors.warning}10`,
          borderColor: colors.warning,
          iconName: icon || 'clock-outline',
          iconColor: colors.warning,
        };
      case 'failed':
        return {
          backgroundColor: `${colors.danger}10`,
          borderColor: colors.danger,
          iconName: icon || 'alert-circle',
          iconColor: colors.danger,
        };
      case 'info':
      default:
        return {
          backgroundColor: `${colors.info}10`,
          borderColor: colors.info,
          iconName: icon || 'information',
          iconColor: colors.info,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          borderColor: typeStyles.borderColor,
          backgroundColor: typeStyles.backgroundColor,
        },
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        Platform.OS === 'ios' && styles.shadowIOS,
      ]}
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.contentContainer}>
          {/* Left icon or image */}
          <View style={styles.leftContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: `${typeStyles.iconColor}20` }]}>
                <Icon name={typeStyles.iconName} size={24} color={typeStyles.iconColor} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>

          {/* Amount */}
          {showAmount && amount !== undefined && (
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  { color: amount > 0 ? colors.success : colors.danger },
                ]}
              >
                {amount > 0 ? '+' : ''}${Math.abs(amount).toFixed(2)}
              </Text>
            </View>
          )}

          {/* Close button */}
          {!preventDismiss && (
            <TouchableWithoutFeedback onPress={handleDismiss}>
              <View style={styles.closeButton}>
                <Icon name="close" size={16} color={colors.gray7} />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: NOTIFICATION_WIDTH,
    minHeight: NOTIFICATION_HEIGHT,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: colors.white,
    overflow: 'hidden',
    ...shadows.lg,
    zIndex: 1000,
    left: 16,
    right: 16,
  },
  topPosition: {
    top: Platform.OS === 'ios' ? 50 : 20,
  },
  bottomPosition: {
    bottom: 20,
  },
  shadowIOS: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  leftContainer: {
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 2,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  amountContainer: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.gray3,
  },
  amount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default TransactionNotification;