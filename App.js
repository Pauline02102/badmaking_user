import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Calendrier from "./screens/Calendrier";
import Match from "./screens/Match";
import inscription from "./screens/inscription";
import Login from "./screens/Login";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

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
              <Ionicons name="calendar" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Match"
          component={Match}
          options={{
            tabBarLabel: "Match",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="aperture-sharp" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Inscription"
          component={inscription}
          options={{
            tabBarLabel: "Inscription",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="log-in-outline" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Login"
          component={Login}
          options={{
            tabBarLabel: "Login",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="log-in-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
