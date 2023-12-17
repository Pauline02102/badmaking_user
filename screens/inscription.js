import React, { useState } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { BASE_URL } from './config';
export default function SignupScreen() {
  const navigation = useNavigation();
  const [nom, setnom] = useState("");
  const [prenom, setprenom] = useState("");
  const [id, setId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = React.useState("");
  const [errorMessage, setErrorMessage] = useState("");
  

  const data = [
    { key: "1", value: "Admin" },
    { key: "2", value: "Joueur" },
  ];

  
  const handleSignup = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/postusers`, { 
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
  
      const data = await response.json(); // Extraction des données JSON de la réponse
  
      console.log("Réponse du serveur:", data,prenom); // Afficher la réponse du serveur
  
      if (response.status === 200) {
        console.log("Inscription réussie");
        //console.log({ prenom, id });
        navigation.navigate("Login", {
          nom: nom,
          prenom: prenom,
          email: email,
          role: role,
          id: data.id,
          onProfilePress: () => navigation.navigate("Profil", {
            nom: nom,
            prenom: prenom,
            email: email,
            //id: data.id,
          }) // Remplacez par la clé appropriée pour l'ID renvoyé par le serveur
        });
      } else {
        // Gérer les autres cas d'erreur ou de réponse inattendue
        console.error("Erreur lors de l'inscription: Réponse inattendue du serveur");
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
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.inputField}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.inputField}
        />
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
  already: {
    padding: 15,
  },
});
