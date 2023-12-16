import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Calendrier from "./screens/Calendrier";
import inscription from "./screens/inscription";
import Login from "./screens/Login";
import Profil from "./screens/Profil";
import Match from "./screens/Match";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import Joueurs from "./screens/Joueurs";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
//const Tab = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Calendrier"
          component={Calendrier}
          options={{
            tabBarLabel: "Calendrier",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="Match"
          component={Match}
          options={{
            tabBarLabel: "Match",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="badminton" size={24} color="black" />
            ),
          }}
        />

        <Tab.Screen
          name="Inscription"
          component={inscription}
          options={{
            tabBarLabel: "Inscription",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-add" size={24} color="black" />
            ),
          }}
        />


        <Tab.Screen
          name="Login"
          component={Login}
          options={{
            tabBarLabel: "Login",
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="login" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="Joueurs"
          component={Joueurs}
          options={{
            tabBarLabel: "Joueurs",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-list-bulleted" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="Profil"
          component={Profil}
          options={{
            tabBarLabel: "Profil",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-edit" size={24} color="black" />

            ),
          }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
