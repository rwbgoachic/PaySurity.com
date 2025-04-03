import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Headline } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { register, error } = useAuth();
  const navigation = useNavigation();

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Handle registration
  const handleRegister = async () => {
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({ username, email, password });
      // If successful, the useAuth hook will update isAuthenticated and navigate automatically
    } catch (err) {
      console.error('Registration failed:', err);
      // Error is displayed by the useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to login screen
  const goToLogin = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.contentContainer}>
            <Headline style={styles.headline}>Create Your Account</Headline>
            <Title style={styles.title}>Join PaySurity today</Title>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={toggleSecureEntry}
                />
              }
              left={<TextInput.Icon icon="lock" />}
            />
            
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureTextEntry}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
            />
            
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Account
            </Button>
            
            <View style={styles.loginContainer}>
              <Text>Already have an account?</Text>
              <Button
                mode="text"
                onPress={goToLogin}
                style={styles.loginButton}
              >
                Sign In
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: theme.colors.text,
  },
  input: {
    marginBottom: 15,
    backgroundColor: theme.colors.background,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButton: {
    marginLeft: 5,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default RegisterScreen;