import { StyleSheet, Text, View } from "react-native"
import { Slot, SplashScreen, Stack } from 'expo-router'
import { useFonts } from 'expo-font';
import { useEffect } from "react";
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
	const [fontsLoaded, error] = useFonts({
		'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
		'IstokWeb-Bold': require('../assets/fonts/IstokWeb-Bold.ttf'),
	  });

	useEffect (() => {
		if(error) throw error;
		if (fontsLoaded) SplashScreen.hideAsync();
		
	}, [fontsLoaded, error])

	
  	return (
		<Stack screenOptions= {{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	)
}

export default RootLayout


