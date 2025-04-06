import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Card, Text, Title, Button, Divider, List, Avatar, FAB, Surface, ProgressBar, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for wallets and goals
interface Wallet {
  id: number;
  name: string;
  balance: string;
  type: string;
  color: string;
  icon: string;
}

interface SavingsGoal {
  id: number;
  title: string;
  targetAmount: string;
  currentAmount: string;
  imageUrl: string;
  dueDate?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  reward: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  dueDate?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  completed: boolean;
}

const ChildWalletScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeWalletId, setActiveWalletId] = useState(1);

  // Sample data - in a real application this would come from API calls
  const wallets: Wallet[] = [
    { id: 1, name: 'Spending', balance: '68.50', type: 'spending', color: theme.colors.primary, icon: 'wallet' },
    { id: 2, name: 'Savings', balance: '132.75', type: 'savings', color: '#4CAF50', icon: 'piggy-bank' },
    { id: 3, name: 'Education', balance: '45.00', type: 'education', color: '#2196F3', icon: 'school' }
  ];

  const savingsGoals: SavingsGoal[] = [
    { 
      id: 1, 
      title: 'New Bike', 
      targetAmount: '250.00', 
      currentAmount: '75.00', 
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=200&h=150',
      dueDate: '2025-07-15'
    },
    { 
      id: 2, 
      title: 'Video Game', 
      targetAmount: '60.00', 
      currentAmount: '40.00', 
      imageUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=200&h=150'
    },
  ];

  const tasks: Task[] = [
    { id: 1, title: 'Clean your room', description: 'Make your bed and tidy up', reward: '5.00', status: 'pending' },
    { id: 2, title: 'Do dishes', reward: '3.00', status: 'completed' },
    { id: 3, title: 'Take out trash', reward: '2.00', status: 'approved' },
  ];

  const lessons: Lesson[] = [
    {
      id: 1,
      title: 'Saving Basics',
      description: 'Learn why saving money is important',
      imageUrl: 'https://images.unsplash.com/photo-1579621970590-9d624316904b?auto=format&fit=crop&q=80&w=300&h=200',
      duration: '5 min',
      completed: true
    },
    {
      id: 2,
      title: 'What is a Budget?',
      description: 'Understanding how to plan your spending',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=300&h=200',
      duration: '7 min',
      completed: false
    },
  ];

  // Format currency
  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Calculate progress percentage for savings goals
  const calculateProgressPercentage = (current: string, target: string) => {
    return Math.min(parseFloat(current) / parseFloat(target), 1);
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, refetch data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Get active wallet
  const activeWallet = wallets.find(w => w.id === activeWalletId) || wallets[0];

  // Navigate to wallet transactions
  const goToTransactions = () => {
    // @ts-ignore
    navigation.navigate('WalletTransactions');
  };

  // Navigate to savings goals
  const goToSavingsGoals = () => {
    // @ts-ignore
    navigation.navigate('SavingsGoals');
  };

  // Navigate to add savings goal
  const goToAddSavingsGoal = () => {
    // @ts-ignore
    navigation.navigate('AddSavingsGoal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <Surface style={[
          styles.balanceCard, 
          { backgroundColor: activeWallet.color }
        ]} elevation={4}>
          <View style={styles.balanceCardContent}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(activeWallet.balance)}</Text>
              <Text style={styles.walletName}>{activeWallet.name} Wallet</Text>
            </View>
            <Avatar.Icon 
              size={50} 
              icon={activeWallet.icon} 
              style={styles.walletIcon} 
            />
          </View>
        </Surface>

        {/* Wallet Selector */}
        <View style={styles.walletSelector}>
          {wallets.map(wallet => (
            <TouchableOpacity
              key={wallet.id}
              style={[
                styles.walletTab,
                activeWalletId === wallet.id && { borderBottomColor: wallet.color, borderBottomWidth: 3 }
              ]}
              onPress={() => setActiveWalletId(wallet.id)}
            >
              <Icon 
                name={wallet.icon} 
                size={20} 
                color={activeWalletId === wallet.id ? wallet.color : theme.colors.placeholder} 
              />
              <Text style={[
                styles.walletTabText,
                { color: activeWalletId === wallet.id ? wallet.color : theme.colors.placeholder }
              ]}>
                {wallet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToTransactions}
          >
            <Avatar.Icon size={40} icon="history" style={styles.actionIcon} />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Avatar.Icon size={40} icon="cash-plus" style={styles.actionIcon} />
            <Text style={styles.actionText}>Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Avatar.Icon size={40} icon="bank-transfer" style={styles.actionIcon} />
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Avatar.Icon size={40} icon="qrcode-scan" style={styles.actionIcon} />
            <Text style={styles.actionText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Savings Goals Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>My Savings Goals</Title>
              <Button 
                icon="arrow-right" 
                mode="text"
                onPress={goToSavingsGoals}
              >
                View All
              </Button>
            </View>
            
            {savingsGoals.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="target" size={48} color={theme.colors.placeholder} />
                <Text style={styles.emptyStateText}>No savings goals yet</Text>
                <Button 
                  mode="contained" 
                  icon="plus" 
                  onPress={goToAddSavingsGoal}
                  style={styles.emptyStateButton}
                >
                  Add Goal
                </Button>
              </View>
            ) : (
              <>
                {savingsGoals.map(goal => (
                  <Card key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalContent}>
                      {/* Goal Image */}
                      <Image 
                        source={{ uri: goal.imageUrl }} 
                        style={styles.goalImage} 
                        resizeMode="cover"
                      />
                      
                      {/* Goal Details */}
                      <View style={styles.goalDetails}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        
                        <View style={styles.goalProgress}>
                          <View style={styles.goalAmounts}>
                            <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
                            <Text style={styles.targetAmount}>of {formatCurrency(goal.targetAmount)}</Text>
                          </View>
                          <ProgressBar 
                            progress={calculateProgressPercentage(goal.currentAmount, goal.targetAmount)} 
                            color={theme.colors.primary}
                            style={styles.progressBar}
                          />
                        </View>
                        
                        {goal.dueDate && (
                          <View style={styles.dueDateContainer}>
                            <Icon name="calendar" size={14} color={theme.colors.placeholder} />
                            <Text style={styles.dueDate}>Due by {new Date(goal.dueDate).toLocaleDateString()}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                ))}
                
                <Button 
                  mode="outlined" 
                  icon="plus" 
                  onPress={goToAddSavingsGoal}
                  style={styles.addGoalButton}
                >
                  Add New Goal
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Tasks & Chores Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Tasks & Chores</Title>
              <Button icon="arrow-right" mode="text">View All</Button>
            </View>
            
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="clipboard-check-outline" size={48} color={theme.colors.placeholder} />
                <Text style={styles.emptyStateText}>No tasks assigned</Text>
              </View>
            ) : (
              <>
                {tasks.map(task => (
                  <Card key={task.id} style={styles.taskCard}>
                    <View style={styles.taskContent}>
                      <View style={styles.taskDetails}>
                        <View style={styles.taskHeader}>
                          <Text style={styles.taskTitle}>{task.title}</Text>
                          <Chip 
                            style={[
                              styles.statusChip,
                              task.status === 'approved' && styles.approvedChip,
                              task.status === 'rejected' && styles.rejectedChip,
                              task.status === 'completed' && styles.completedChip,
                            ]} 
                            textStyle={styles.statusChipText}
                          >
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Chip>
                        </View>
                        
                        {task.description && (
                          <Text style={styles.taskDescription}>{task.description}</Text>
                        )}
                        
                        <View style={styles.taskReward}>
                          <Icon name="cash" size={16} color={theme.colors.primary} />
                          <Text style={styles.rewardAmount}>Reward: {formatCurrency(task.reward)}</Text>
                        </View>
                      </View>
                      
                      {task.status === 'pending' && (
                        <Button 
                          mode="contained" 
                          compact 
                          style={styles.markCompleteButton}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </View>
                  </Card>
                ))}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Financial Education Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Learn About Money</Title>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.lessonCardsContainer}
            >
              {lessons.map(lesson => (
                <Card key={lesson.id} style={styles.lessonCard}>
                  <Card.Cover source={{ uri: lesson.imageUrl }} style={styles.lessonImage} />
                  <Card.Content style={styles.lessonContent}>
                    <View style={styles.lessonHeader}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      {lesson.completed && (
                        <Icon name="check-circle" size={20} color="#4CAF50" />
                      )}
                    </View>
                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                    <View style={styles.lessonMeta}>
                      <Icon name="clock-outline" size={14} color={theme.colors.placeholder} />
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                  </Card.Content>
                  <Card.Actions>
                    <Button mode={lesson.completed ? "outlined" : "contained"}>
                      {lesson.completed ? "Review" : "Start"}
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* FAB for payments */}
      <FAB
        style={styles.fab}
        icon="cash-register"
        label="Pay"
        onPress={() => console.log('Pay')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  balanceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  walletName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  walletIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  walletTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  walletTabText: {
    marginLeft: 4,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: theme.colors.primaryContainer,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 8,
    color: theme.colors.placeholder,
    marginBottom: 8,
  },
  emptyStateButton: {
    marginTop: 8,
  },
  goalCard: {
    marginBottom: 12,
  },
  goalContent: {
    flexDirection: 'row',
    padding: 12,
  },
  goalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  goalDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  goalProgress: {
    marginVertical: 4,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  targetAmount: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dueDate: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginLeft: 4,
  },
  addGoalButton: {
    marginTop: 8,
  },
  taskCard: {
    marginBottom: 10,
  },
  taskContent: {
    padding: 12,
  },
  taskDetails: {
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 24,
    backgroundColor: theme.colors.primaryContainer,
  },
  approvedChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  rejectedChip: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  completedChip: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusChipText: {
    fontSize: 10,
  },
  taskDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 8,
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardAmount: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.primary,
  },
  markCompleteButton: {
    alignSelf: 'flex-end',
  },
  lessonCardsContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  lessonCard: {
    width: 250,
    marginRight: 16,
    overflow: 'hidden',
  },
  lessonImage: {
    height: 120,
  },
  lessonContent: {
    padding: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  lessonDescription: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default ChildWalletScreen;