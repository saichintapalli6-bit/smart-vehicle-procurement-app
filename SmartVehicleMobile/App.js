import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BuyerDashboard from './src/screens/BuyerDashboard';
import SellerDashboard from './src/screens/SellerDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import DrawerContent from './src/components/DrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main app screens wrapped in Drawer navigation
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: '#0c0f15',
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEnabled: true,
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Login" component={LoginScreen} />
      <Drawer.Screen name="Register" component={RegisterScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { flex: 1, backgroundColor: '#060714' },
          }}
        >
          {/* Drawer screens (public pages with sidebar) */}
          <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />

          {/* Dashboard screens (no drawer needed after login) */}
          <Stack.Screen name="BuyerDashboard" component={BuyerDashboard} />
          <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060714',
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
});
