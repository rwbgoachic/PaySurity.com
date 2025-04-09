import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, commonStyles, shadows } from '../../utils/theme';
import { useWallet, Contact } from '../../hooks/useWallet';

const SendMoneyScreen = () => {
  const navigation = useNavigation();
  const { contacts, fetchContacts, isLoading, error } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [frequentContacts, setFrequentContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (contacts) {
      setFrequentContacts(contacts.filter(contact => contact.isFrequent));
      filterContacts(searchQuery);
    }
  }, [contacts, searchQuery]);

  const filterContacts = (query: string) => {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(
      contact =>
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(query.toLowerCase())) ||
        (contact.phone && contact.phone.includes(query))
    );

    setFilteredContacts(filtered);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMoney = () => {
    if (!selectedContact) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Navigate to payment process screen
    navigation.navigate('PaymentProcess', {
      amount: parseFloat(amount),
      recipientId: selectedContact.id,
      recipientName: selectedContact.name,
      description: note,
      transactionType: 'send',
    });
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContact?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => handleContactSelect(item)}
      >
        <View style={styles.contactAvatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.contactAvatar} />
          ) : (
            <View
              style={[
                styles.contactInitials,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : `${colors.primary}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.initialsText,
                  { color: isSelected ? colors.white : colors.primary },
                ]}
              >
                {item.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactDetail}>
            {item.email || item.phone || item.relationship || ''}
          </Text>
        </View>
        {isSelected && <Icon name="check-circle" size={24} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  const renderFrequentContacts = () => {
    if (frequentContacts.length === 0) return null;

    return (
      <View style={styles.frequentContactsContainer}>
        <Text style={styles.frequentContactsTitle}>Frequent Contacts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {frequentContacts.map(contact => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.frequentContactItem,
                selectedContact?.id === contact.id && styles.selectedFrequentContact,
              ]}
              onPress={() => handleContactSelect(contact)}
            >
              <View
                style={[
                  styles.frequentContactAvatar,
                  {
                    backgroundColor:
                      selectedContact?.id === contact.id
                        ? colors.primary
                        : `${colors.primary}20`,
                  },
                ]}
              >
                {contact.avatarUrl ? (
                  <Image source={{ uri: contact.avatarUrl }} style={styles.contactAvatar} />
                ) : (
                  <Text
                    style={[
                      styles.frequentContactInitials,
                      {
                        color:
                          selectedContact?.id === contact.id
                            ? colors.white
                            : colors.primary,
                      },
                    ]}
                  >
                    {contact.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.frequentContactName,
                  selectedContact?.id === contact.id && { color: colors.primary },
                ]}
                numberOfLines={1}
              >
                {contact.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.gray9} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Selected Contact Info */}
        {selectedContact && (
          <View style={styles.selectedContactContainer}>
            <View style={styles.selectedContactHeader}>
              <Text style={styles.selectedContactLabel}>Sending to:</Text>
              <TouchableOpacity onPress={() => setSelectedContact(null)}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.selectedContactInfo}>
              {selectedContact.avatarUrl ? (
                <Image
                  source={{ uri: selectedContact.avatarUrl }}
                  style={styles.selectedContactAvatar}
                />
              ) : (
                <View style={styles.selectedContactInitials}>
                  <Text style={styles.selectedInitialsText}>
                    {selectedContact.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
              )}
              <View style={styles.selectedContactDetails}>
                <Text style={styles.selectedContactName}>{selectedContact.name}</Text>
                <Text style={styles.selectedContactDetail}>
                  {selectedContact.email || selectedContact.phone || ''}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            multiline
          />
        </View>

        {/* Recipient Selection */}
        {!selectedContact && (
          <>
            {/* Frequent Contacts */}
            {renderFrequentContacts()}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color={colors.gray7} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name, email or phone"
                clearButtonMode="while-editing"
              />
            </View>

            {/* Contacts List */}
            <View style={styles.contactsContainer}>
              <Text style={styles.contactsTitle}>All Contacts</Text>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading contacts...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={24} color={colors.danger} />
                  <Text style={styles.errorText}>Failed to load contacts</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchContacts()}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredContacts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-search" size={40} color={colors.gray6} />
                  <Text style={styles.emptyText}>No contacts found</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  renderItem={renderContactItem}
                  contentContainerStyle={styles.contactsList}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!selectedContact || !amount || parseFloat(amount) <= 0) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSendMoney}
          disabled={!selectedContact || !amount || parseFloat(amount) <= 0}
        >
          <Text style={styles.sendButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  selectedContactContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...shadows.sm,
  },
  selectedContactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedContactLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  changeButton: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  selectedContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedContactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selectedContactInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedInitialsText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  selectedContactDetails: {
    marginLeft: 12,
    flex: 1,
  },
  selectedContactName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 4,
  },
  selectedContactDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  noteContainer: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
    marginBottom: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    fontSize: typography.fontSize.md,
    color: colors.gray9,
    textAlignVertical: 'top',
  },
  frequentContactsContainer: {
    marginBottom: 24,
  },
  frequentContactsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
    marginBottom: 12,
  },
  frequentContactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  selectedFrequentContact: {
    // Add any selected state styles here
  },
  frequentContactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  frequentContactInitials: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  frequentContactName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray8,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: typography.fontSize.md,
    color: colors.gray9,
  },
  contactsContainer: {
    flex: 1,
  },
  contactsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
    marginBottom: 12,
  },
  contactsList: {
    paddingBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    ...shadows.xs,
  },
  selectedContactItem: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}05`,
  },
  contactAvatarContainer: {
    marginRight: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray9,
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.danger,
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray2,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.md,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray4,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});

export default SendMoneyScreen;