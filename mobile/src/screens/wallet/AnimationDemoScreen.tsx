import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, commonStyles } from '../../utils/theme';
import { useAnimationToolkit } from '../../components/animations/AnimationToolkit';
import AnimatedCard from '../../components/animations/AnimatedCard';
import AnimatedButton from '../../components/animations/AnimatedButton';
import ScreenTransition from '../../components/animations/ScreenTransition';
import LoadingAnimation from '../../components/animations/LoadingAnimation';
import ProgressIndicator from '../../components/animations/ProgressIndicator';

const AnimationDemoScreen = () => {
  const navigation = useNavigation();
  const animationToolkit = useAnimationToolkit();
  
  // State for demo options
  const [currentSection, setCurrentSection] = useState('cards');
  const [sectionVisible, setSectionVisible] = useState(true);
  const [enableCustomAnim, setEnableCustomAnim] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Demo card data
  const demoCards = [
    {
      id: '1',
      cardHolder: 'John Doe',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cardType: 'visa',
      isDefault: true,
      balance: 5782.45,
    },
    {
      id: '2',
      cardHolder: 'John Doe',
      cardNumber: '5555555555554444',
      expiryDate: '10/24',
      cardType: 'mastercard',
      isDefault: false,
      balance: 2340.12,
    },
  ];
  
  // Progress steps for demo
  const progressSteps = [
    { label: 'Cart', status: 'completed', icon: 'cart-outline' },
    { label: 'Shipping', status: 'completed', icon: 'truck-delivery-outline' },
    { label: 'Payment', status: 'current' },
    { label: 'Confirmation', status: 'pending' },
  ];
  
  // Change section with animation
  const changeSection = (section: string) => {
    // Hide current section
    setSectionVisible(false);
    
    // Wait for exit animation to complete
    setTimeout(() => {
      setCurrentSection(section);
      setSectionVisible(true);
    }, 300);
  };
  
  // Demo functions to show animations from the toolkit
  const showNotificationDemo = (type: 'success' | 'pending' | 'failed' | 'info') => {
    let title, message, amount;
    
    switch (type) {
      case 'success':
        title = 'Payment Successful';
        message = 'Your payment of $85.50 to Coffee Shop was completed';
        amount = -85.5;
        break;
      case 'pending':
        title = 'Payment Processing';
        message = 'Your payment of $45.20 is being processed';
        amount = -45.2;
        break;
      case 'failed':
        title = 'Payment Failed';
        message = 'Your payment of $120.00 to Market Shop failed';
        amount = -120;
        break;
      case 'info':
        title = 'Money Received';
        message = 'You received $250.00 from John Smith';
        amount = 250;
        break;
    }
    
    animationToolkit.showNotification({
      type,
      title,
      message,
      amount,
      showAmount: true,
      autoHide: true,
      hideAfter: 3000,
      position: 'top',
    });
  };
  
  // Show loading demo
  const showLoadingDemo = (type: string) => {
    animationToolkit.showLoading({
      type: type as any,
      message: `Loading with ${type} animation...`,
      showIcon: true,
    });
    
    // Hide after 3 seconds
    setTimeout(() => {
      animationToolkit.hideLoading();
    }, 3000);
  };
  
  // Show progress demo
  const showProgressDemo = (type: string) => {
    if (type === 'step') {
      animationToolkit.showProgress({
        type: 'step',
        steps: progressSteps,
        currentStep: 2,
        message: 'Processing payment...',
        showStepLabels: true,
      });
    } else if (type === 'countdown') {
      animationToolkit.showProgress({
        type: 'countdown',
        countdown: 5,
        message: 'Your payment will complete in...',
        onComplete: () => {
          animationToolkit.hideProgress();
          
          // Show success notification
          animationToolkit.showNotification({
            type: 'success',
            title: 'Payment Successful',
            message: 'Your payment was completed successfully',
            amount: -99.99,
            showAmount: true,
          });
        },
      });
    } else {
      let progress = 0;
      animationToolkit.showProgress({
        type: type as any,
        progress: 0,
        showPercentage: true,
        message: `${type} progress demo`,
      });
      
      // Simulate progress increase
      const interval = setInterval(() => {
        progress += 0.1;
        animationToolkit.updateProgress(progress);
        
        if (progress >= 1) {
          clearInterval(interval);
          
          // Hide after completion
          setTimeout(() => {
            animationToolkit.hideProgress();
          }, 1000);
        }
      }, 500);
    }
  };
  
  // Custom card animation
  const animateCard = () => {
    Animated.sequence([
      Animated.timing(cardScaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Render card animations section
  const renderCardAnimations = () => {
    return (
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Card Animations</Text>
        
        <View style={styles.cardContainer}>
          {enableCustomAnim ? (
            <Animated.View style={{ transform: [{ scale: cardScaleAnim }] }}>
              <AnimatedCard
                id={demoCards[0].id}
                cardHolder={demoCards[0].cardHolder}
                cardNumber={demoCards[0].cardNumber}
                expiryDate={demoCards[0].expiryDate}
                cardType={demoCards[0].cardType as any}
                isDefault={demoCards[0].isDefault}
                balance={demoCards[0].balance}
                onPress={() => animateCard()}
                animationType="none"
              />
            </Animated.View>
          ) : (
            <AnimatedCard
              id={demoCards[0].id}
              cardHolder={demoCards[0].cardHolder}
              cardNumber={demoCards[0].cardNumber}
              expiryDate={demoCards[0].expiryDate}
              cardType={demoCards[0].cardType as any}
              isDefault={demoCards[0].isDefault}
              balance={demoCards[0].balance}
              animationType="pulse"
            />
          )}
        </View>
        
        <View style={styles.optionsContainer}>
          <Text style={styles.optionLabel}>Custom Animation:</Text>
          <Switch
            value={enableCustomAnim}
            onValueChange={setEnableCustomAnim}
            trackColor={{ false: colors.gray4, true: `${colors.primary}80` }}
            thumbColor={enableCustomAnim ? colors.primary : colors.white}
          />
        </View>
        
        <View style={styles.buttonGrid}>
          <AnimatedButton
            label="Scale In"
            onPress={() => animateCard()}
            variant="primary"
            size="small"
            disabled={!enableCustomAnim}
            style={styles.gridButton}
          />
          <AnimatedButton
            label="Pulse"
            onPress={() => {}}
            variant="primary"
            size="small"
            animateOnLoad={true}
            style={styles.gridButton}
            iconName="pulse"
            iconPosition="left"
          />
          <AnimatedButton
            label="Bounce"
            onPress={() => {}}
            variant="secondary"
            size="small"
            style={styles.gridButton}
          />
        </View>
      </View>
    );
  };
  
  // Render button animations section
  const renderButtonAnimations = () => {
    return (
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Button Animations</Text>
        
        <View style={styles.buttonsContainer}>
          <AnimatedButton
            label="Primary Button"
            onPress={() => {}}
            variant="primary"
            size="medium"
            iconName="check"
            iconPosition="left"
            style={styles.demoButton}
            animateOnLoad={true}
          />
          
          <AnimatedButton
            label="Secondary Button"
            onPress={() => {}}
            variant="secondary"
            size="medium"
            style={styles.demoButton}
          />
          
          <AnimatedButton
            label="Outline Button"
            onPress={() => {}}
            variant="outline"
            size="medium"
            style={styles.demoButton}
          />
          
          <AnimatedButton
            label="Ghost Button"
            onPress={() => {}}
            variant="ghost"
            size="medium"
            style={styles.demoButton}
          />
          
          <AnimatedButton
            label="Danger Button"
            onPress={() => {}}
            variant="danger"
            size="medium"
            style={styles.demoButton}
          />
          
          <AnimatedButton
            label="Loading State"
            onPress={() => {}}
            variant="primary"
            size="medium"
            loading={true}
            style={styles.demoButton}
          />
          
          <AnimatedButton
            label="Rounded Button"
            onPress={() => {}}
            variant="primary"
            size="medium"
            rounded={true}
            style={styles.demoButton}
          />
          
          <AnimatedButton
            label="Full Width"
            onPress={() => {}}
            variant="primary"
            size="large"
            fullWidth={true}
            style={styles.demoButton}
          />
        </View>
      </View>
    );
  };
  
  // Render loading animations section
  const renderLoadingAnimations = () => {
    return (
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Loading Animations</Text>
        
        <View style={styles.loadingGrid}>
          <View style={styles.loadingItem}>
            <LoadingAnimation
              type="spinner"
              size="small"
              color={colors.primary}
            />
            <Text style={styles.loadingLabel}>Spinner</Text>
          </View>
          
          <View style={styles.loadingItem}>
            <LoadingAnimation
              type="pulse"
              size="small"
              color={colors.secondary}
            />
            <Text style={styles.loadingLabel}>Pulse</Text>
          </View>
          
          <View style={styles.loadingItem}>
            <LoadingAnimation
              type="dots"
              size="small"
              color={colors.primary}
            />
            <Text style={styles.loadingLabel}>Dots</Text>
          </View>
          
          <View style={styles.loadingItem}>
            <LoadingAnimation
              type="card"
              size="small"
              color={colors.info}
              showIcon={true}
            />
            <Text style={styles.loadingLabel}>Card</Text>
          </View>
          
          <View style={styles.loadingItem}>
            <LoadingAnimation
              type="transaction"
              size="small"
              color={colors.secondary}
              showIcon={true}
            />
            <Text style={styles.loadingLabel}>Transaction</Text>
          </View>
          
          <View style={styles.loadingItem}>
            <LoadingAnimation
              type="success"
              size="small"
              color={colors.success}
              showIcon={true}
            />
            <Text style={styles.loadingLabel}>Success</Text>
          </View>
        </View>
        
        <Text style={styles.subTitle}>Global Loading Overlay</Text>
        
        <View style={styles.buttonGrid}>
          <AnimatedButton
            label="Spinner"
            onPress={() => showLoadingDemo('spinner')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
          <AnimatedButton
            label="Card"
            onPress={() => showLoadingDemo('card')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
          <AnimatedButton
            label="Transaction"
            onPress={() => showLoadingDemo('transaction')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
        </View>
      </View>
    );
  };
  
  // Render progress animations section
  const renderProgressAnimations = () => {
    return (
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Progress Indicators</Text>
        
        <View style={styles.progressContainer}>
          <ProgressIndicator
            type="linear"
            progress={0.6}
            showPercentage={true}
            animated={true}
            style={styles.progressItem}
          />
          
          <ProgressIndicator
            type="circular"
            progress={0.75}
            showPercentage={true}
            animated={true}
            style={styles.progressItem}
            message="Circular Progress"
          />
          
          <ProgressIndicator
            type="step"
            steps={progressSteps}
            currentStep={2}
            showStepLabels={true}
            style={[styles.progressItem, styles.stepProgress]}
          />
        </View>
        
        <Text style={styles.subTitle}>Global Progress Overlay</Text>
        
        <View style={styles.buttonGrid}>
          <AnimatedButton
            label="Linear"
            onPress={() => showProgressDemo('linear')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
          <AnimatedButton
            label="Circular"
            onPress={() => showProgressDemo('circular')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
          <AnimatedButton
            label="Step"
            onPress={() => showProgressDemo('step')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
          <AnimatedButton
            label="Countdown"
            onPress={() => showProgressDemo('countdown')}
            variant="primary"
            size="small"
            style={styles.gridButton}
          />
        </View>
      </View>
    );
  };
  
  // Render notification demos section
  const renderNotificationDemos = () => {
    return (
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Transaction Notifications</Text>
        
        <View style={styles.notificationButtons}>
          <AnimatedButton
            label="Success"
            onPress={() => showNotificationDemo('success')}
            variant="primary"
            iconName="check-circle"
            iconPosition="left"
            style={styles.notifButton}
          />
          
          <AnimatedButton
            label="Pending"
            onPress={() => showNotificationDemo('pending')}
            variant="secondary"
            iconName="clock-outline"
            iconPosition="left"
            style={styles.notifButton}
          />
          
          <AnimatedButton
            label="Failed"
            onPress={() => showNotificationDemo('failed')}
            variant="danger"
            iconName="alert-circle"
            iconPosition="left"
            style={styles.notifButton}
          />
          
          <AnimatedButton
            label="Info"
            onPress={() => showNotificationDemo('info')}
            variant="outline"
            iconName="information"
            iconPosition="left"
            style={styles.notifButton}
          />
        </View>
      </View>
    );
  };
  
  // Render current section content
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'cards':
        return renderCardAnimations();
      case 'buttons':
        return renderButtonAnimations();
      case 'loading':
        return renderLoadingAnimations();
      case 'progress':
        return renderProgressAnimations();
      case 'notifications':
        return renderNotificationDemos();
      default:
        return renderCardAnimations();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.gray9} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Animation Toolkit</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.navigationTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              currentSection === 'cards' && styles.activeTab,
            ]}
            onPress={() => changeSection('cards')}
          >
            <Icon 
              name="credit-card-outline" 
              size={20} 
              color={currentSection === 'cards' ? colors.primary : colors.gray7} 
            />
            <Text 
              style={[
                styles.tabText,
                currentSection === 'cards' && styles.activeTabText,
              ]}
            >
              Cards
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabItem,
              currentSection === 'buttons' && styles.activeTab,
            ]}
            onPress={() => changeSection('buttons')}
          >
            <Icon 
              name="gesture-tap-button" 
              size={20} 
              color={currentSection === 'buttons' ? colors.primary : colors.gray7} 
            />
            <Text 
              style={[
                styles.tabText,
                currentSection === 'buttons' && styles.activeTabText,
              ]}
            >
              Buttons
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabItem,
              currentSection === 'loading' && styles.activeTab,
            ]}
            onPress={() => changeSection('loading')}
          >
            <Icon 
              name="loading" 
              size={20} 
              color={currentSection === 'loading' ? colors.primary : colors.gray7} 
            />
            <Text 
              style={[
                styles.tabText,
                currentSection === 'loading' && styles.activeTabText,
              ]}
            >
              Loading
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabItem,
              currentSection === 'progress' && styles.activeTab,
            ]}
            onPress={() => changeSection('progress')}
          >
            <Icon 
              name="progress-check" 
              size={20} 
              color={currentSection === 'progress' ? colors.primary : colors.gray7} 
            />
            <Text 
              style={[
                styles.tabText,
                currentSection === 'progress' && styles.activeTabText,
              ]}
            >
              Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabItem,
              currentSection === 'notifications' && styles.activeTab,
            ]}
            onPress={() => changeSection('notifications')}
          >
            <Icon 
              name="bell-outline" 
              size={20} 
              color={currentSection === 'notifications' ? colors.primary : colors.gray7} 
            />
            <Text 
              style={[
                styles.tabText,
                currentSection === 'notifications' && styles.activeTabText,
              ]}
            >
              Notifications
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenTransition 
          visible={sectionVisible}
          transitionType="fade"
          duration={300}
        >
          {renderSectionContent()}
        </ScreenTransition>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  navigationTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  demoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
    marginTop: 16,
    marginBottom: 12,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray8,
    marginRight: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridButton: {
    margin: 8,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  demoButton: {
    marginBottom: 16,
    minWidth: 200,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
    marginTop: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressItem: {
    marginBottom: 24,
  },
  stepProgress: {
    width: '100%',
  },
  notificationButtons: {
    alignItems: 'center',
  },
  notifButton: {
    marginBottom: 16,
    minWidth: 200,
  },
});

export default AnimationDemoScreen;