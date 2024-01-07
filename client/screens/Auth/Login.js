import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import UserContext from "./UserContext";
import { useUser } from "./UserContext";
import { BASE_URL } from '../config';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SelectList } from "react-native-dropdown-select-list";


export default function LoginScreen () {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nom, setnom] = useState("");
  const [role, setRole] = React.useState("");
  const { setIsSignedIn } = useUser();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  

  const data = [
    { key: "1", value: "admin" },
    { key: "2", value: "joueur" },
  ];

  const handleLogin = async () => {
    try {
      const loginData = {
        
        email: email,
        password: password,
      };
  
      const response = await fetch(`${BASE_URL}/user_tokens/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
  
      const data = await response.json();
  
      
  
      if (response.status === 200 && data.token) {
      
        await AsyncStorage.setItem('userToken', data.token);
        console.log("Token stored successfully");
  
        setIsSignedIn(true);
  
        console.log("Connexion réussie");
      } else {
        console.error("Token manquant ou erreur de connexion");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading} testID="ConnexionText">Connexion</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.inputField}
        />


        <TextInput
          placeholder="Mot de passe"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.inputField}
          testID="passwordInput"
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon} testID="eyeIcon">
          <Icon
            name={showPassword ? 'eye-slash' : 'eye'}
            size={20}
            color="#000"
          />
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <SelectList
            placeholder="Rôle"
            setSelected={(val) => setRole(val)}
            data={data}
            save="value"
            style={styles.choix}
           
            testID="roleSelect" 
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin} testID="ButtonConnexion">
        <Text style={styles.buttonText}  >Connexion</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.already}>Tu n'as pas de compte ?</Text>
        <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.navigate({
          name: 'Inscription',
        }))}>
          <Text style={styles.signupLink}>Inscription</Text>
        </TouchableOpacity>
      </View>
 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 30,
    shadowColor: "rgba(0, 0, 0, 0.062)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
  },
  heading: {
    fontSize: 26,
    color: "#2e2e2e",
    fontWeight: "bold",
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 30,
    marginTop:20
  },
  inputField: {
    width: "100%",
    minHeight: 60, 
    borderBottomWidth: 2,
    borderBottomColor: "rgb(173, 173, 173)",
    backgroundColor: "transparent",
    color: "black",
    fontSize: 16,
    fontWeight: "500",
    paddingLeft: 30,
  },
  button: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#283b67",
    backgroundColor: "#4d8194",
    height: 40,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -5
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 1,
  },
  signupContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    marginTop: 20,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "#2e2e2e",
    color: "white",
    textDecorationLine: "none",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  already: {
    padding: 15,
  }, 
  eyeIcon: {
    position: "absolute",
    right: 12,
    marginTop: 78
  },
});
