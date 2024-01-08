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
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { BASE_URL } from '../config';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNPickerSelect from "react-native-picker-select";
import PrivacyPolicyScreen from './PrivacyPolicyScreen';


export default function SignupScreen() {
  const [isConsentChecked, setConsentChecked] = useState(false);

  const handleCheckboxChange = () => {
    setConsentChecked(!isConsentChecked);
  };
  const navigation = useNavigation();
  const [nom, setnom] = useState("");
  const [prenom, setprenom] = useState("");
  const [id, setId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("joueur");

  const [errorMessage, setErrorMessage] = useState("");
  const [classementSimple, setClassementSimple] = useState(null);
  const [classementDouble, setClassementDouble] = useState(null);
  const [classementMixte, setClassementMixte] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [inputStates, setInputStates] = useState({
    nom: false,
    prenom: false,
    email: false,
    password: false,
    role: false,
    classementSimple: false,
    classementDouble: false,
    classementMixte: false,
  });
  const [classementSimpleError, setClassementSimpleError] = useState(false);
  const [classementDoubleError, setClassementDoubleError] = useState(false);
  const [classementMixteError, setClassementMixteError] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const data = [

    { key: "2", value: "joueur" },
  ];

  const handleSignup = async () => {


    const inputStateCopy = { ...inputStates };
    let hasEmptyFields = false;

    if (nom === "") {
      inputStateCopy.nom = true;
      hasEmptyFields = true;
    }
    if (prenom === "") {
      inputStateCopy.prenom = true;
      hasEmptyFields = true;
    }
    if (email === "") {
      inputStateCopy.email = true;
      hasEmptyFields = true;
    }
    if (password === "") {
      inputStateCopy.password = true;
      hasEmptyFields = true;
    }
    if (role === "") {
      inputStateCopy.role = true;
      hasEmptyFields = true;
    }
    if (classementSimple === null) {
      setClassementSimpleError(true);
      hasEmptyFields = true;
    } else {
      setClassementSimpleError(false);
    }

    if (classementDouble === null) {
      setClassementDoubleError(true);
      hasEmptyFields = true;
    } else {
      setClassementDoubleError(false);
    }

    if (classementMixte === null) {
      setClassementMixteError(true);
      hasEmptyFields = true;
    } else {
      setClassementMixteError(false);
    }

    setInputStates(inputStateCopy);

    if (hasEmptyFields) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires.");
      return;
    }

    // Vérifier que l'email contient "@" et "."
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Erreur", "L'adresse email doit contenir '@' et '.'.");
      return;
    }

    // Vérifier que le mot de passe satisfait les critères
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!])/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins une majuscule, un caractère spécial (@#$%^&+=!) et au moins un chiffre."
      );
      return;
    }

    try {
      console.log("Avant l'envoi de la requête au serveur");

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
          classementSimple: classementSimple,
          classementDouble: classementDouble,
          classementMixte: classementMixte,
        }),
      });

      console.log("Après la réponse du serveur"); // Après la réponse du serveur

      const data = await response.json(); // Extraction des données JSON de la réponse



      if (response.status === 201) {
        console.log("Inscription réussie");
        navigation.navigate("Login");
      } else if (response.status === 400) {
        const errorMessage = data.message;
        if (errorMessage === "L'utilisateur avec cet e-mail existe déjà.") {
          Alert.alert("Erreur", "L'utilisateur avec cet e-mail existe déjà.");
        } else {
          console.error("Erreur lors de l'inscription: Réponse inattendue du serveur");
          setErrorMessage("Erreur lors de l'inscription");
        }
      } else {
        console.error("Erreur lors de l'inscription: Réponse inattendue du serveur");
        setErrorMessage("Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      setErrorMessage("Erreur lors de l'inscription");
    }
  };


  function generateClassementItems() {
    const classements = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    return classements.map((classement) => ({
      label: classement,
      value: classement,
    }));
  }



  return (
    
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView >
          <View style={styles.container}>


            <Text style={styles.classementInfo}>
              * Classement 1 = le plus élevé , 12 = le plus bas
            </Text>
            <Text style={styles.heading} testID="inscriptionText">Inscription</Text>
            <View style={styles.inputContainer}>
              <View style={styles.classementContainer}>
                <Text style={styles.classementTitle}>Classements :</Text>
                <View style={styles.classementInputs}>
                  <View style={[styles.classementInput, { flex: 1 }]}>
                    <Text style={{ color: classementSimpleError ? 'red' : 'black' }}>Simple:</Text>
                    <RNPickerSelect
                      onValueChange={(value) => setClassementSimple(value)}
                      items={generateClassementItems()}
                      value={classementSimple}
                      placeholder={{
                        label: "A remplir",
                        value: null,
                      }}
                    />
                  </View>
                  <View style={[styles.classementInput, { flex: 1 }]}>
                    <Text style={{ color: classementDoubleError ? 'red' : 'black' }}>Double:</Text>
                    <RNPickerSelect
                      onValueChange={(value) => setClassementDouble(value)}
                      items={generateClassementItems()}
                      value={classementDouble}
                      placeholder={{
                        label: "A remplir",
                        value: null,
                      }}
                    />
                  </View>
                  <View style={[styles.classementInput, { flex: 1 }]}>
                    <Text style={{ color: classementMixteError ? 'red' : 'black' }}>Mixte:</Text>
                    <RNPickerSelect
                      onValueChange={(value) => setClassementMixte(value)}
                      items={generateClassementItems()}
                      value={classementMixte}
                      placeholder={{
                        label: "A remplir",
                        value: null,
                      }}
                    />
                  </View>
                </View>

              </View>


              <TextInput
                placeholder="Nom"
                value={nom}
                onChangeText={(text) => setnom(text)}
                style={[
                  styles.inputField,
                  inputStates.nom && { borderBottomColor: "red" },
                ]}
              />
              <TextInput
                placeholder="Prenom"
                value={prenom}
                onChangeText={(text) => setprenom(text)}
                style={[
                  styles.inputField,
                  inputStates.nom && { borderBottomColor: "red" },
                ]}
              />


              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={[
                  styles.inputField,
                  inputStates.nom && { borderBottomColor: "red" },
                ]}
                keyboardType="email-address" // Utilise le clavier adapté aux adresses email
                autoCapitalize="none"
              />

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Mot de passe"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  style={[
                    styles.inputField,
                    inputStates.nom && { borderBottomColor: "red" },
                  ]}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                  <Icon
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>


              <View style={styles.inputContainerRole} >
                <SelectList
                  placeholder="Rôle"
                  setSelected={(val) => setRole(val)}
                  data={data}
                  save="value"

                  style={styles.choix}
                />
              </View>
            </View>

            <View style={styles.switchContainer}>
              <Switch
                value={isConsentChecked}
                onValueChange={handleCheckboxChange}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isConsentChecked ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                testID="consentCheckbox"
              />
              <Text style={styles.consentText}>
                J'accepte les conditions générales d'utilisation et la politique de confidentialité.{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                >
                  En savoir plus.
                </Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup} testID="inscriptionButton">
              <Text style={styles.buttonText}>Inscription</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.already}>Tu as deja un compte ?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signupLink}>Connecte-toi</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    
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
  
  classementInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    fontSize: 12,
    color: "#333",
    paddingBottom: 10
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
    marginTop: 20
  },
  
  inputContainerRole: {
    width: "100%",
    position: "relative",
    marginBottom: 20,
    display: 'none',
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
    marginTop: -20
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
    marginBottom: 20,
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
    padding: 5,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    marginTop: 20
  },
  classementContainer: {
    marginTop: 7,
    marginBottom: 10,
  },
  classementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  classementInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  classementInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 30,
    paddingTop: -10,


  },
  consentText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#333",
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
