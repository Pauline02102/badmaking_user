import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import UserContext from "./UserContext";
import { useUser } from "./UserContext";


const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setnom] = useState("");
  const [role, setRole] = React.useState("");
  const { setIsSignedIn } = useUser();
  

  const handleLogin = async () => {
    try {
      const loginData = {
        
        prenom,
        email,
        password,
        nom
      };

      const response = await fetch("http://192.168.1.6:3030/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json(); // Extraction des données JSON de la réponse
  
      console.log("Réponse du serveur:", data); // Afficher la réponse du serveur
  
      if (response.status === 200 && data.token) {
        console.log("Storing token:", data.token);
        await AsyncStorage.setItem('userToken', data.token);
        console.log("Token stored successfully"); //stocker le token

        setIsSignedIn(true); // Mettre à jour l'état global de connexion
        
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
      <Text style={styles.heading}>Connexion</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.inputField}
        />
        <TextInput
          placeholder="Prenom"
          value={prenom}
          onChangeText={(text) => setPrenom(text)}
          style={styles.inputField}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.inputField}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>
      <View style={styles.signupContainer}>
        <Text style={styles.already}>Tu n'as pas de compte ?</Text>
        <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.navigate({
          name:'Inscription',
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
    fontSize: 24,
    color: "#2e2e2e",
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  inputField: {
    width: "100%",
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: "rgb(173, 173, 173)",
    backgroundColor: "transparent",
    color: "black",
    fontSize: 16,
    fontWeight: "500",
    paddingLeft: 40,
  },
  button: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#8000ff",
    backgroundColor: "#8000ff",
    height: 40,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
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
  already:{
    padding:15,
  }
});

export default LoginScreen;
