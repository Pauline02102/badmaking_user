import React, { useState } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { BASE_URL } from './config';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SignupScreen() {

  const navigation = useNavigation();
  const [nom, setnom] = useState("");
  const [prenom, setprenom] = useState("");
  const [id, setId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = React.useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const data = [
    { key: "1", value: "admin" },
    { key: "2", value: "joueur" },
  ];

  const handleSignup = async () => {

 

    // Vérifier que l'email contient "@" et "."
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Erreur", "L'adresse email doit contenir '@' et '.'.");
      return;
    }

    try {
      console.log("Avant l'envoi de la requête au serveur"); // Avant l'envoi de la requête au serveur

      const response = await fetch(`http://192.168.1.6:3030/users/postusers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: nom,
          prenom: prenom,
          role: role,
          email: email,
          password: password,
        }),
      });

      console.log("Après la réponse du serveur"); // Après la réponse du serveur

      const data = await response.json(); // Extraction des données JSON de la réponse

      console.log("Réponse du serveur:", data, prenom); // Afficher la réponse du serveur

      if (response.status === 201) {
        console.log("Inscription réussie");
        navigation.navigate("Login"); // Redirection vers la page de connexion
      } else if (response.status === 400) {
        // Gérer le cas où l'utilisateur existe déjà
        console.error("L'utilisateur existe déjà.");
        setErrorMessage("L'utilisateur existe déjà.");
      } else {
        // Gérer les autres cas d'erreur ou de réponse inattendue
        console.error("Erreur lors de l'inscription: Réponse inattendue du serveur");
        setErrorMessage("Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      setErrorMessage("Erreur lors de l'inscription");
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Inscription</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Nom"
          value={nom}
          onChangeText={(text) => setnom(text)}
          style={styles.inputField}
        />
        <TextInput
          placeholder="Prenom"
          value={prenom}
          onChangeText={(text) => setprenom(text)}
          style={styles.inputField}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.inputField}
          keyboardType="email-address" // Utilise le clavier adapté aux adresses email
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mot de passe"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.inputField}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
          <Icon
            name={showPassword ? 'eye-slash' : 'eye'}
            size={20}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <SelectList
          placeholder="Rôle"
          setSelected={(val) => setRole(val)}
          data={data}
          save="value"
          style={styles.choix}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Inscription</Text>
      </TouchableOpacity>
      <View style={styles.signupContainer}>
        <Text style={styles.already}>Tu as deja un compte ?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.signupLink}>Connecte-toi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    right: 10, // Ajustez la valeur pour définir la distance entre l'icône et le champ de mot de passe
  },

});
