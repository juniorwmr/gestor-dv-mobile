import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";

import Clients from "./screens/Clients";
import Profile from "./screens/Profile";
import History from "./screens/History";

const AppStack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

function clientsApp() {
  return (
    <AppStack.Navigator
      headerMode="none"
      screenOptions={{
        cardStyle: {
          backgroundColor: "#f0f0f5",
        },
      }}
    >
      <AppStack.Screen name="Cliente" component={Clients} />
      <AppStack.Screen name="Profile" component={Profile} />
    </AppStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Clientes"
          component={clientsApp}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="users" color={color} size={18} />
            ),
          }}
        />
        <Tab.Screen
          name="Histórico"
          component={History}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="history" color={color} size={18} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
