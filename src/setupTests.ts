import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

jest.doMock('@react-native-community/async-storage', () => mockAsyncStorage);
