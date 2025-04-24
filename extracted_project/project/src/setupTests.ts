import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IndexedDB
require('fake-indexeddb/auto');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: (index: number) => null,
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Intl.DateTimeFormat
const mockDateTimeFormat = {
  resolvedOptions: () => ({
    locale: 'en-US',
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'America/New_York'
  })
};

jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => mockDateTimeFormat as unknown as Intl.DateTimeFormat);