import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrivacyPolicyScreen from './screens/Auth/PrivacyPolicyScreen';
import { UserProvider, useUser } from './screens/Auth/UserContext';
import SignupScreen from './screens/Auth/inscription';
import Calendrier from "./screens/Calendrier/Calendrier";
import Login from "./screens/Auth/Login";
import Profil from "./screens/Profil/Profil";
import Match from "./screens/Match/Match";
import Joueurs from "./screens/Joueur/Joueurs";
import inscription from "./screens/Auth/inscription";
import { BASE_URL } from './screens/config';
import gestionEvent from './screens/Calendrier/gestionEvent';
import Calendars from "./assets/icons/Calendars.js";
import Edits from './assets/icons/Edits.js';
import ProfilEdit from './assets/icons/ProfilEdit.js';
import Resultat from './assets/icons/Resulats.js';
import Badminton from './assets/icons/Badminton.js';
import Stat from './assets/icons/Stat.js';

const AuthStack = createStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        

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
        component={SignupScreen}
      />
      <AuthStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'CGU et Politique de Confidentialité' }}
      />
    </AuthStack.Navigator>
  );
}

function AppTabs() {
  const { userRole } = useUser();
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Calendrier" component={Calendrier}
        options={{
          cardStyle: { marginTop: 110 },
          tabBarLabel: "Calendrier",
          tabBarIcon: ({ color, size }) => (
            <Calendars  size={24} height={24} color="black" />
          ),
          headerShown: false,

        }} />
      {userRole === 'joueur' && (
        <Tabs.Screen name="Match" component={Match} options={{
          tabBarLabel: "Match",
          tabBarIcon: ({ color, size }) => (
            <Badminton name="badminton" size={24} color="black" />
          ),
          headerShown: false,
        }} />
      )}
      {userRole === 'joueur' && (
        <Tabs.Screen name="Joueurs" component={Joueurs} options={{
          tabBarLabel: "Résultats",
          tabBarIcon: ({ color, size }) => (
            <Stat name="format-list-bulleted" size={24} color="black" />
          ),
          headerShown: false,
        }} />
      )}
      <Tabs.Screen name="Profil" component={Profil} options={{
        tabBarLabel: "Profil",
        tabBarIcon: ({ color, size }) => (
          <ProfilEdit name="account-edit" size={24} color="black" />

        ),
        headerShown: false,
      }} />

      {userRole === 'admin' && (
        <Tabs.Screen name="Gestion d'évenement" component={gestionEvent} options={{
          tabBarLabel: "Gestion d'évenements",
          
          tabBarIcon: ({ color, size }) => (
            <Edits name="published-with-changes" size={24} color="black" />
          

          ),
          headerShown: false,
        }} />
        
      )}


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



const fetchUserRole = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/user_tokens/get-user-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log("role", data.user.role, ": prenom", data.user.prenom)
      return data.user.role;

    } else {
      throw new Error(data.message || 'Impossible de récupérer le rôle de l\'utilisateur.');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle de l\'utilisateur:', error);
    return null;
  }
};

function AppContent() {
  const { isSignedIn, setIsSignedIn, setUserRole, userRole } = useUser();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsSignedIn(true);
        const role = await fetchUserRole(token);
        setUserRole(role);
      }
      else {
        // Si aucun token n'est trouvé, redirige vers la page de connexion
        setIsSignedIn(false);
      }
    };

    checkToken();
  }, [isSignedIn, setIsSignedIn, setUserRole, userRole]);

  return (
    <NavigationContainer>
      {isSignedIn ? <AppTabs /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
