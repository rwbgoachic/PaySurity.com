import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { View, Animated, Easing, BackHandler, StyleSheet, Dimensions } from 'react-native';
import TransactionNotification from './TransactionNotification';
import LoadingAnimation from './LoadingAnimation';
import ProgressIndicator from './ProgressIndicator';

const { width, height } = Dimensions.get('window');

// Types for the animation toolkit
type NotificationType = 'success' | 'pending' | 'failed' | 'info';
type LoadingType = 'spinner' | 'pulse' | 'dots' | 'success' | 'error' | 'card' | 'transaction';
type ProgressType = 'linear' | 'circular' | 'step' | 'countdown';

interface NotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  showAmount?: boolean;
  icon?: string;
  image?: string;
  onPress?: () => void;
  autoHide?: boolean;
  hideAfter?: number;
  preventDismiss?: boolean;
  position?: 'top' | 'bottom';
}

interface LoadingOptions {
  type?: LoadingType;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  showIcon?: boolean;
  iconName?: string;
  iconAnimated?: boolean;
}

interface ProgressOptions {
  type?: ProgressType;
  progress?: number;
  steps?: {
    label: string;
    status: 'completed' | 'current' | 'pending';
    icon?: string;
  }[];
  currentStep?: number;
  totalSteps?: number;
  color?: string;
  showPercentage?: boolean;
  message?: string;
  animated?: boolean;
  countdown?: number;
  onComplete?: () => void;
  showStepLabels?: boolean;
}

interface AnimationToolkitContextType {
  showNotification: (options: NotificationOptions) => void;
  hideNotification: () => void;
  showLoading: (options?: LoadingOptions) => void;
  hideLoading: () => void;
  showProgress: (options: ProgressOptions) => void;
  updateProgress: (progress: number) => void;
  updateProgressStep: (step: number) => void;
  hideProgress: () => void;
  animateElement: (element: any, animationType: string, duration?: number) => void;
  transition: (callback: () => void, type?: string, duration?: number) => void;
}

// Create context
const AnimationToolkitContext = createContext<AnimationToolkitContextType | undefined>(undefined);

// Animation provider component
export const AnimationToolkitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Notification state
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationOptions, setNotificationOptions] = useState<NotificationOptions | null>(null);
  
  // Loading state
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState<LoadingOptions | null>(null);
  
  // Progress state
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressOptions, setProgressOptions] = useState<ProgressOptions | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Handle back button press when modal is open
  useEffect(() => {
    const backAction = () => {
      if (loadingVisible || progressVisible) {
        return true; // Prevent default back behavior
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [loadingVisible, progressVisible]);

  // Show notification
  const showNotification = (options: NotificationOptions) => {
    setNotificationOptions(options);
    setNotificationVisible(true);
  };

  // Hide notification
  const hideNotification = () => {
    setNotificationVisible(false);
  };

  // Show loading overlay
  const showLoading = (options: LoadingOptions = {}) => {
    setLoadingOptions(options);
    setLoadingVisible(true);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Hide loading overlay
  const hideLoading = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => {
      setLoadingVisible(false);
      setLoadingOptions(null);
    });
  };

  // Show progress indicator
  const showProgress = (options: ProgressOptions) => {
    setProgressOptions(options);
    setProgress(options.progress || 0);
    setCurrentStep(options.currentStep || 0);
    setProgressVisible(true);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Update progress value
  const updateProgress = (value: number) => {
    setProgress(value);
  };

  // Update progress step
  const updateProgressStep = (step: number) => {
    setCurrentStep(step);
  };

  // Hide progress indicator
  const hideProgress = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => {
      setProgressVisible(false);
      setProgressOptions(null);
    });
  };

  // Generic element animation
  const animateElement = (element: any, animationType: string, duration: number = 300) => {
    if (!element || !element.current) return;

    const animatedValue = element.current;

    switch (animationType) {
      case 'fadeIn':
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();
        break;
      case 'fadeOut':
        Animated.timing(animatedValue, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();
        break;
      case 'scaleIn':
        Animated.spring(animatedValue, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        break;
      case 'scaleOut':
        Animated.timing(animatedValue, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();
        break;
      case 'slideInLeft':
        Animated.spring(animatedValue, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        break;
      case 'slideOutLeft':
        Animated.timing(animatedValue, {
          toValue: -width,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();
        break;
      case 'slideInRight':
        Animated.spring(animatedValue, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        break;
      case 'slideOutRight':
        Animated.timing(animatedValue, {
          toValue: width,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();
        break;
      case 'pulse':
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.1,
            duration: duration / 2,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]).start();
        break;
      default:
        break;
    }
  };

  // Screen transition
  const transition = (callback: () => void, type: string = 'fade', duration: number = 300) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: duration / 2,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      // Execute callback
      callback();
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    });
  };

  // Context value
  const contextValue: AnimationToolkitContextType = {
    showNotification,
    hideNotification,
    showLoading,
    hideLoading,
    showProgress,
    updateProgress,
    updateProgressStep,
    hideProgress,
    animateElement,
    transition,
  };

  return (
    <AnimationToolkitContext.Provider value={contextValue}>
      {children}

      {/* Notification component */}
      {notificationOptions && (
        <TransactionNotification
          visible={notificationVisible}
          type={notificationOptions.type}
          title={notificationOptions.title}
          message={notificationOptions.message}
          amount={notificationOptions.amount}
          showAmount={notificationOptions.showAmount}
          icon={notificationOptions.icon}
          image={notificationOptions.image}
          onPress={notificationOptions.onPress}
          onDismiss={hideNotification}
          autoHide={notificationOptions.autoHide}
          hideAfter={notificationOptions.hideAfter}
          preventDismiss={notificationOptions.preventDismiss}
          position={notificationOptions.position}
        />
      )}

      {/* Loading overlay */}
      {loadingVisible && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LoadingAnimation
              type={loadingOptions?.type}
              size={loadingOptions?.size}
              color={loadingOptions?.color}
              message={loadingOptions?.message}
              showIcon={loadingOptions?.showIcon}
              iconName={loadingOptions?.iconName}
              iconAnimated={loadingOptions?.iconAnimated}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Progress overlay */}
      {progressVisible && progressOptions && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ProgressIndicator
              type={progressOptions.type}
              progress={progress}
              steps={progressOptions.steps}
              currentStep={currentStep}
              totalSteps={progressOptions.totalSteps}
              color={progressOptions.color}
              showPercentage={progressOptions.showPercentage}
              message={progressOptions.message}
              animated={progressOptions.animated}
              countdown={progressOptions.countdown}
              onComplete={() => {
                if (progressOptions.onComplete) {
                  progressOptions.onComplete();
                }
              }}
              showStepLabels={progressOptions.showStepLabels}
            />
          </Animated.View>
        </Animated.View>
      )}
    </AnimationToolkitContext.Provider>
  );
};

// Hook to use the animation toolkit
export const useAnimationToolkit = () => {
  const context = useContext(AnimationToolkitContext);
  if (context === undefined) {
    throw new Error('useAnimationToolkit must be used within an AnimationToolkitProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    alignItems: 'center',
  },
});

export default {
  AnimationToolkitProvider,
  useAnimationToolkit,
};