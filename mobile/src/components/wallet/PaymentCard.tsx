import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, shadows } from '../../utils/theme';

// Card network logos
const CARD_NETWORKS = {
  visa: require('../../assets/card-networks/visa.png'),
  mastercard: require('../../assets/card-networks/mastercard.png'),
  amex: require('../../assets/card-networks/amex.png'),
  discover: require('../../assets/card-networks/discover.png'),
  default: require('../../assets/card-networks/generic.png'),
};

// Card background patterns
const CARD_BACKGROUNDS = {
  pattern1: require('../../assets/card-backgrounds/pattern1.png'),
  pattern2: require('../../assets/card-backgrounds/pattern2.png'),
  pattern3: require('../../assets/card-backgrounds/pattern3.png'),
  pattern4: require('../../assets/card-backgrounds/pattern4.png'),
};

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'default';
export type CardStyle = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

type PaymentCardProps = {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cardType: CardType;
  isDefault?: boolean;
  balance?: number;
  cardStyle?: CardStyle;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
  gradientColors?: string[];
  showBalance?: boolean;
  small?: boolean;
};

const { width } = Dimensions.get('window');
const CARD_ASPECT_RATIO = 1.586; // Standard credit card ratio

const PaymentCard: React.FC<PaymentCardProps> = ({
  id,
  cardHolder,
  cardNumber,
  expiryDate,
  cardType = 'default',
  isDefault = false,
  balance,
  cardStyle = 'pattern1',
  onPress,
  onLongPress,
  gradientColors = [colors.primaryDark, colors.primary],
  showBalance = true,
  small = false,
}) => {
  // Format card number with proper spacing and masking
  const formatCardNumber = (number: string) => {
    // Only show last 4 digits
    return '•••• •••• •••• ' + number.slice(-4);
  };

  // Card dimensions calculation
  const cardWidth = small ? width * 0.75 : width - 32;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          width: cardWidth,
          height: cardHeight,
          ...(!small ? shadows.md : shadows.sm),
        },
      ]}
      onPress={() => onPress && onPress(id)}
      onLongPress={() => onLongPress && onLongPress(id)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <ImageBackground
          source={CARD_BACKGROUNDS[cardStyle]}
          style={styles.cardBackground}
          imageStyle={styles.cardBackgroundImage}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              {/* Payment provider logo or bank name can go here */}
              <Text style={styles.bankName}>PaySurity</Text>
              
              {isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>

            {showBalance && balance !== undefined && (
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.cardNumberContainer}>
              <Text style={styles.cardNumber}>{formatCardNumber(cardNumber)}</Text>
              <Image
                source={CARD_NETWORKS[cardType] || CARD_NETWORKS.default}
                style={styles.cardTypeIcon}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardBottomRow}>
              <View style={styles.cardHolderContainer}>
                <Text style={styles.cardHolderLabel}>Card Holder</Text>
                <Text style={styles.cardHolderName}>{cardHolder}</Text>
              </View>

              <View style={styles.expiryContainer}>
                <Text style={styles.expiryLabel}>Expires</Text>
                <Text style={styles.expiryDate}>{expiryDate}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
  },
  cardBackground: {
    flex: 1,
    padding: 20,
  },
  cardBackgroundImage: {
    opacity: 0.1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  defaultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  defaultText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  balanceContainer: {
    marginVertical: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  cardNumber: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 2,
  },
  cardTypeIcon: {
    width: 60,
    height: 40,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHolderContainer: {},
  cardHolderLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.xs,
    marginBottom: 4,
  },
  cardHolderName: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  expiryContainer: {},
  expiryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.xs,
    marginBottom: 4,
  },
  expiryDate: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});

export default PaymentCard;