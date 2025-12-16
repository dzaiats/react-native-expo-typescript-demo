import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsListScreen } from '@/screens/EventsListScreen';
import { EventDetailsScreen } from '@/screens/EventDetailsScreen';
import { ScannerScreen } from '@/screens/ScannerScreen';
import { BasketScreen } from '@/screens/BasketScreen';
import { useThemeStore } from '@/store/themeStore';
import { useBasketStore } from '@/store/basketStore';
import { Text } from 'react-native';

export type RootStackParamList = {
  Events: undefined;
  EventDetails: { eventSqid: string; eventTitle: string };
};

export type TabParamList = {
  EventsTab: undefined;
  Scanner: undefined;
  Basket: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const EventsStack = () => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Events"
        component={EventsListScreen}
        options={{ title: 'Events' }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          title: 'Event Details',
          headerBackTitleVisible: false,
          headerBackAccessibilityLabel: 'Back to Events',
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const itemCount = useBasketStore((state) => state.getItemCount());

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="EventsTab"
          component={EventsStack}
          options={{
            title: 'Events',
            tabBarTestID: 'tab-events',
            tabBarAccessibilityLabel: 'Events Tab',
            tabBarIcon: ({ color, size }) => (
              <Text
                testID="tab-events-icon"
                style={{ color, fontSize: size }}
              >
                📅
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{
            title: 'Scanner',
            tabBarTestID: 'tab-scanner',
            tabBarAccessibilityLabel: 'Scanner Tab',
            tabBarIcon: ({ color, size }) => (
              <Text
                testID="tab-scanner-icon"
                style={{ color, fontSize: size }}
              >
                📷
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Basket"
          component={BasketScreen}
          options={{
            title: 'Basket',
            tabBarTestID: 'tab-basket',
            tabBarAccessibilityLabel: 'Basket Tab',
            tabBarIcon: ({ color, size }) => (
              <Text
                testID="tab-basket-icon"
                style={{ color, fontSize: size }}
              >
                🛒
              </Text>
            ),
            tabBarBadge: itemCount > 0 ? itemCount : undefined,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

