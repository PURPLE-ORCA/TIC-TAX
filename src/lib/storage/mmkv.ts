import { createMMKV } from 'react-native-mmkv';

export const appPreferencesStorage = createMMKV({
  id: 'tic-tax-preferences',
});
