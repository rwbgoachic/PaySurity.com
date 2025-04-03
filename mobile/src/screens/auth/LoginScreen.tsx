import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Headline } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { login, error } = useAuth();
  const navigation = useNavigation();

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Handle login
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);
      // If successful, the useAuth hook will update isAuthenticated and navigate automatically
    } catch (err) {
      console.error('Login failed:', err);
      // Error is displayed by the useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to register screen
  const goToRegister = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            {/* Logo placeholder - replace with actual logo */}
            <Image 
              source={require('../../assets/logo-placeholder.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.contentContainer}>
            <Headline style={styles.headline}>Welcome to PaySurity</Headline>
            <Title style={styles.title}>Sign in to your account</Title>
            
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
            
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Sign In
            </Button>
            
            <View style={styles.registerContainer}>
              <Text>Don't have an account?</Text>
              <Button
                mode="text"
                onPress={goToRegister}
                style={styles.registerButton}
              >
                Create Account
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButton: {
    marginLeft: 5,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginScreen;