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

type ProgressType = 'linear' | 'circular' | 'step' | 'countdown';

interface ProgressStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  icon?: string;
}

interface ProgressIndicatorProps {
  type?: ProgressType;
  progress?: number; // 0 to 1
  steps?: ProgressStep[];
  currentStep?: number;
  totalSteps?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  width?: number;
  radius?: number;
  showPercentage?: boolean;
  showValue?: boolean;
  message?: string;
  messageStyle?: TextStyle;
  style?: ViewStyle;
  strokeWidth?: number;
  animated?: boolean;
  duration?: number;
  countdown?: number; // seconds for countdown
  onComplete?: () => void;
  showStepLabels?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'linear',
  progress = 0,
  steps = [],
  currentStep = 0,
  totalSteps = 0,
  color = colors.primary,
  backgroundColor = colors.gray3,
  height = 8,
  width = 300,
  radius = 60,
  showPercentage = false,
  showValue = false,
  message,
  messageStyle,
  style,
  strokeWidth = 8,
  animated = true,
  duration = 500,
  countdown = 0,
  onComplete,
  showStepLabels = true,
}) => {
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(countdown)).current;

  // Calculate current progress
  const calculatedProgress = steps.length > 0
    ? currentStep / (steps.length - 1)
    : totalSteps > 0
    ? currentStep / totalSteps
    : progress;

  // Update animation value when progress changes
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: calculatedProgress,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // We need to animate width/height which requires useNativeDriver: false
      }).start(() => {
        // Call onComplete callback when progress reaches 100%
        if (calculatedProgress >= 1 && onComplete) {
          onComplete();
        }
      });
    } else {
      progressAnim.setValue(calculatedProgress);
    }
  }, [calculatedProgress, animated, duration]);

  // Handle countdown timer
  useEffect(() => {
    if (type === 'countdown' && countdown > 0) {
      countdownAnim.setValue(countdown);
      
      const animation = Animated.timing(countdownAnim, {
        toValue: 0,
        duration: countdown * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      });

      animation.start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });

      return () => {
        animation.stop();
      };
    }
  }, [countdown, type]);

  // Format time for countdown display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render linear progress bar
  const renderLinearProgress = () => {
    return (
      <View style={[styles.linearContainer, { height, width, backgroundColor }]}>
        <Animated.View
          style={[
            styles.linearFill,
            {
              height,
              backgroundColor: color,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width],
              }),
            },
          ]}
        />
        {showPercentage && (
          <Animated.Text
            style={[
              styles.percentageText,
              {
                color: colors.gray9,
              },
            ]}
          >
            {progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            })}
          </Animated.Text>
        )}
      </View>
    );
  };

  // Render circular progress indicator
  const renderCircularProgress = () => {
    // Calculate circumference
    const circumference = 2 * Math.PI * radius;

    return (
      <View style={styles.circularContainer}>
        <View style={{ width: radius * 2, height: radius * 2 }}>
          {/* Background circle */}
          <View
            style={[
              styles.circleBackground,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                borderWidth: strokeWidth,
                borderColor: backgroundColor,
              },
            ]}
          />

          {/* Animated progress circle */}
          <Animated.View
            style={[
              styles.circleProgress,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                borderWidth: strokeWidth,
                borderColor: color,
                transform: [
                  { rotateZ: '-90deg' },
                  {
                    scale: 1,
                  },
                ],
                opacity: 1,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: type === 'countdown' ? color : 'transparent',
                borderLeftColor: type === 'countdown' ? color : 'transparent',
              },
              type === 'countdown'
                ? {
                    transform: [
                      { rotateZ: countdownAnim.interpolate({
                          inputRange: [0, countdown],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  }
                : {
                    transform: [
                      { rotateZ: '-90deg' },
                      {
                        rotateZ: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
            ]}
          />

          {/* Center content */}
          <View style={styles.circleCenter}>
            {showPercentage && type !== 'countdown' && (
              <Animated.Text
                style={styles.circlePercentageText}
              >
                {progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })}
              </Animated.Text>
            )}
            {type === 'countdown' && (
              <Animated.Text
                style={styles.circlePercentageText}
              >
                {countdownAnim.interpolate({
                  inputRange: [0, countdown],
                  outputRange: [formatTime(0), formatTime(countdown)],
                  extrapolate: 'clamp',
                })}
              </Animated.Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Render step progress indicator
  const renderStepProgress = () => {
    const stepCount = steps.length || totalSteps;
    const stepWidth = width / (stepCount - 1);

    return (
      <View style={[styles.stepContainer, { width }]}>
        {/* Progress line */}
        <View style={[styles.stepLineContainer, { height: height / 2 }]}>
          <View style={[styles.stepBackgroundLine, { height: height / 2, backgroundColor }]} />
          <Animated.View
            style={[
              styles.stepProgressLine,
              {
                height: height / 2,
                backgroundColor: color,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width],
                }),
              },
            ]}
          />
        </View>

        {/* Step dots */}
        <View style={styles.stepsContainer}>
          {steps.length > 0
            ? steps.map((step, index) => (
                <View key={index} style={[styles.stepItem, { left: index * stepWidth }]}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor:
                          step.status === 'completed' || step.status === 'current'
                            ? color
                            : backgroundColor,
                        borderColor:
                          step.status === 'current' ? color : 'transparent',
                        width: step.status === 'current' ? height * 1.5 : height,
                        height: step.status === 'current' ? height * 1.5 : height,
                        borderRadius: step.status === 'current' ? (height * 1.5) / 2 : height / 2,
                      },
                    ]}
                  >
                    {step.icon && step.status === 'completed' && (
                      <Icon
                        name={step.icon}
                        size={height / 2}
                        color={colors.white}
                      />
                    )}
                  </View>
                  {showStepLabels && (
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color:
                            step.status === 'completed' || step.status === 'current'
                              ? colors.gray9
                              : colors.gray6,
                          fontWeight:
                            step.status === 'current'
                              ? typography.fontWeight.bold
                              : typography.fontWeight.medium,
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  )}
                </View>
              ))
            : Array.from({ length: totalSteps }).map((_, index) => (
                <View key={index} style={[styles.stepItem, { left: index * stepWidth }]}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor:
                          index <= currentStep ? color : backgroundColor,
                        borderColor:
                          index === currentStep ? color : 'transparent',
                        width: index === currentStep ? height * 1.5 : height,
                        height: index === currentStep ? height * 1.5 : height,
                        borderRadius: index === currentStep ? (height * 1.5) / 2 : height / 2,
                      },
                    ]}
                  />
                </View>
              ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {type === 'linear' && renderLinearProgress()}
      {type === 'circular' && renderCircularProgress()}
      {(type === 'step' || steps.length > 0) && renderStepProgress()}
      {type === 'countdown' && renderCircularProgress()}
      
      {message && (
        <Text
          style={[
            styles.message,
            { color: colors.gray9 },
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
  linearContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  linearFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  percentageText: {
    position: 'absolute',
    right: 8,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlePercentageText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  stepContainer: {
    position: 'relative',
    height: 60,
  },
  stepLineContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -4,
  },
  stepBackgroundLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  stepProgressLine: {
    position: 'absolute',
    left: 0,
  },
  stepsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  stepItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -6 }],
  },
  stepDot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    width: 70,
  },
  message: {
    marginTop: 16,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default ProgressIndicator;