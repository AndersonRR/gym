import { View, StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';

import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Routes } from './src/routes';
import { THEME } from './src/theme';

import { AuthContext, AuthContextProvider } from '@contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>{fontsLoaded ? <Routes /> : <View />}</AuthContextProvider>
      </QueryClientProvider>
    </NativeBaseProvider>
  );
}
