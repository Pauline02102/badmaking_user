import React, { useState, useEffect ,useContext} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator ,TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserProvider } from './screens/UserContext';

import Calendrier from "./screens/Calendrier";

import Login from "./screens/Login";
import Profil from "./screens/Profil";
import Match from "./screens/Match";
import Joueurs from "./screens/Joueurs";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from "react-native-vector-icons/Ionicons";
import { AntDesign } from '@expo/vector-icons';
import inscription from "./screens/inscription";
import { useUser } from "./screens/UserContext";

const AuthStack = createStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        // Animation et transition
        ...TransitionPresets.ModalPresentationIOS    , // Choisissez l'animation que vous préférez
  
        // Style de l'en-tête
        headerStyle: {
          backgroundColor: '#467c86', // Couleur de fond de l'en-tête
        },
        headerTintColor: '#fff', // Couleur du texte de l'en-tête
        headerTitleStyle: {
          fontWeight: 'bold',
        },
  
        // Masquer l'en-tête pour un look épuré
        headerShown: false,
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={Login}
      />
      <AuthStack.Screen
        name="Inscription"
        component={inscription}
      />
    </AuthStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Calendrier" component={Calendrier} options={{
        tabBarLabel: "Calendrier",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" size={24} color="black" />
        ),
      }} />
      <Tabs.Screen name="Match" component={Match} options={{
        tabBarLabel: "Match",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="badminton" size={24} color="black" />
        ),
      }} />
      <Tabs.Screen name="Joueurs" component={Joueurs} options={{
        tabBarLabel: "Joueurs",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color="black" />
        ),
      }} />
      <Tabs.Screen name="Profil" component={Profil} options={{
        tabBarLabel: "Profil",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account-edit" size={24} color="black" />

        ),
      }} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider> 
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const { isSignedIn, setIsSignedIn } = useUser();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsSignedIn(true);
      }
    };

    checkToken();
  }, [setIsSignedIn]);

  return (
    <NavigationContainer>
      {isSignedIn ? <AppTabs /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
