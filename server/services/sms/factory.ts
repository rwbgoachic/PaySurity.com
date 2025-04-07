import { ISmsProvider } from './provider.interface';
import { TwilioProvider } from './twilio.provider';
import { TextMagicProvider } from './textmagic.provider';
import { MessageBirdProvider } from './messagebird.provider';
import { MockSmsProvider } from './mock.provider';

type SmsProviderType = 'twilio' | 'textmagic' | 'messagebird' | 'mock' | string;

export class SmsProviderFactory {
  private static instance: SmsProviderFactory;
  private providers: Map<string, ISmsProvider> = new Map();
  private activeProvider: ISmsProvider | null = null;
  
  private constructor() {
    this.registerProvider('twilio', new TwilioProvider());
    this.registerProvider('textmagic', new TextMagicProvider());
    this.registerProvider('messagebird', new MessageBirdProvider());
    this.registerProvider('mock', new MockSmsProvider());
    
    // Set default provider based on environment
    const defaultProvider = process.env.SMS_PROVIDER || 'mock';
    this.setActiveProvider(defaultProvider);
  }
  
  public static getInstance(): SmsProviderFactory {
    if (!SmsProviderFactory.instance) {
      SmsProviderFactory.instance = new SmsProviderFactory();
    }
    return SmsProviderFactory.instance;
  }
  
  public registerProvider(name: string, provider: ISmsProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }
  
  public getProvider(name: SmsProviderType): ISmsProvider | null {
    return this.providers.get(name.toLowerCase()) || null;
  }
  
  public getActiveProvider(): ISmsProvider | null {
    return this.activeProvider;
  }
  
  public setActiveProvider(name: SmsProviderType): boolean {
    const provider = this.getProvider(name);
    
    if (provider) {
      // Only set as active if it's configured
      if (provider.isConfigured()) {
        this.activeProvider = provider;
        console.log(`Active SMS provider set to: ${provider.getName()}`);
        return true;
      } else {
        console.warn(`SMS provider '${name}' is not properly configured`);
      }
    }
    
    // If requested provider is not available or configured, try others
    for (const [providerName, providerInstance] of this.providers.entries()) {
      if (providerInstance.isConfigured()) {
        this.activeProvider = providerInstance;
        console.log(`Falling back to SMS provider: ${providerInstance.getName()}`);
        return true;
      }
    }
    
    // If no configured providers, default to mock
    const mockProvider = this.getProvider('mock');
    if (mockProvider) {
      this.activeProvider = mockProvider;
      console.warn('No configured SMS providers found, using mock provider');
      return true;
    }
    
    console.error('No SMS providers available');
    return false;
  }
  
  public getAvailableProviders(): string[] {
    const available: string[] = [];
    
    this.providers.forEach((provider, name) => {
      if (provider.isConfigured()) {
        available.push(name);
      }
    });
    
    return available;
  }
}
