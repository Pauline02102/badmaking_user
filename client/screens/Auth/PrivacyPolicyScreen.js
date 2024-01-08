import React from 'react';
import { View, Text, StyleSheet ,TouchableOpacity} from 'react-native';
import { useNavigation } from "@react-navigation/native";
export default function PrivacyPolicyScreen( ) {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Politique de Confidentialité</Text>
      <Text>
        Votre vie privée est importante pour nous. Cette politique de
        confidentialité explique comment nous collectons, utilisons et
        protégeons vos informations personnelles.
      </Text>
      <Text style={styles.sectionHeading}>Informations que nous collectons</Text>
      <Text>
        Lorsque vous utilisez notre application, nous pouvons collecter les
        informations suivantes :
      </Text>
      <Text>- Votre Nom</Text>
      <Text>- Votre Prenom</Text>
      <Text>- Votre Adresse e-mail</Text>
     
      <Text style={styles.sectionHeading}>Utilisation des informations</Text>
      <Text>
        Nous utilisons les informations collectées pour améliorer notre service,
        personnaliser votre expérience utilisateur.
      </Text>
      <Text style={styles.sectionHeading}>Partage des informations</Text>
      <Text>
        Nous ne partagerons pas vos informations personnelles avec des tiers sans
        votre consentement, sauf si requis par la loi.
      </Text>
      <Text style={styles.sectionHeading}>Sécurité des informations</Text>
      <Text>
        La sécurité de vos informations personnelles est importante pour nous, et
        nous mettons en œuvre des mesures de sécurité pour les protéger contre
        tout accès non autorisé.
      </Text>
      <Text style={styles.sectionHeading}>Vos droits</Text>
      <Text>
        Vous avez le droit d'accéder à vos informations personnelles, de les
        corriger ou de les anonymiser. Vous pouvez également nous contacter pour
        exercer ces droits.
      </Text>
      <Text style={styles.sectionHeading}>Contact</Text>
      <Text>
        Si vous avez des questions concernant notre politique de confidentialité
        ou vos informations personnelles, veuillez nous contacter à
        l'adresse vdhpauline@hotmail.com
      </Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate("Inscription")} 
      >
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#4d8194',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
