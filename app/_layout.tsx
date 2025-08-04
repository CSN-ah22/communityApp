import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native";
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff', // 기본 배경색
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#fff", // 다크 모드 배경색(일단은 화이트)
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? MyDarkTheme : MyTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="+not-found" /> */}
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaView>
    </ThemeProvider>
  );
}