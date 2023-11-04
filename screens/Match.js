import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import axios from "axios";
import _ from "lodash";

class MatchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: [], // Stocke les données des matchs
      groups: [], // Stocke les groupes de matchs
      groupsCreated: false, // État pour savoir si les groupes ont été créés
    };
  }

  createGroups = () => {
    const { matches } = this.state;
    const groupedMatches = _.chunk(matches, 4);
    this.setState({ groups: groupedMatches, groupsCreated: true });
    groupedMatches.forEach((group, index) => {
      console.log(`Groupe ${index + 1}:`, group);
    });
  };
  componentDidMount() {
    this.fetchMatches();
    // Ajoutez le rafraîchissement périodique des matchs ici
    this.refreshInterval = setInterval(() => {
      this.fetchMatches();
    }, 3030); // Rafraîchir
  }
  componentWillUnmount() {
    // Assurez-vous de nettoyer l'intervalle lorsque le composant est démonté
    clearInterval(this.refreshInterval);
  }
  fetchMatches = async () => {
    try {
      // Récupérez les matchs depuis le backend
      const response = await axios.get("http://172.20.10.4:3030/matches");
      const matches = response.data;
  
      // Regrouper les joueurs par ID de match
      const groupedMatches = {};
      matches.forEach((match) => {
        if (!groupedMatches[match.id]) {
          groupedMatches[match.id] = [];
        }
        groupedMatches[match.id].push({ nom: match.nom, prenom: match.prenom });
      });
  
      // Convertir les groupes de matchs en tableau
      const matchGroups = Object.values(groupedMatches);
  
      this.setState({ matches: matchGroups });
    } catch (error) {
      console.error("Erreur lors de la récupération des matchs", error);
    }
  };
  

fetchMatches = async () => {
  try {
    // Récupérez les matchs depuis le backend
    const response = await axios.get("http://172.20.10.4:3030/matches");
    const matches = response.data;

    // Regrouper les joueurs par ID de match
    const groupedMatches = {};
    matches.forEach((match) => {
      if (!groupedMatches[match.id]) {
        groupedMatches[match.id] = [];
      }
      groupedMatches[match.id].push({ nom: match.nom, prenom: match.prenom });
    });

    // Convertir les groupes de matchs en tableau
    const matchGroups = Object.values(groupedMatches);

    this.setState({ matches: matchGroups });
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs", error);
  }
};
renderMatchItem = ({ item }) => {
  // Assurez-vous que les valeurs sont définies avant d'y accéder
  if (item[0] && item[1] && item[2] && item[3]) {
    // Affichez les données du match en mode 2 vs 2
    return (
      <View style={styles.matchItem}>
        <Text style={styles.dateText}>Date : {item.date}</Text>
        <View style={styles.badmintonMatchContainer}>
          <View style={styles.badmintonPlayerColumn}>
            
            <View style={styles.badmintonPlayer}>
              <Text style={styles.playerText}>
                {item[0].prenom} {item[0].nom}</Text>
            </View>

            <View style={styles.badmintonPlayer}>
              <Text style={styles.playerText}>
                {item[1].prenom} {item[1].nom}</Text>
            </View>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.badmintonPlayerColumn}>
            <View style={styles.badmintonPlayer}>
              <Text style={styles.playerText}>
                {item[2].prenom} {item[2].nom}</Text>
            </View>

            <View style={styles.badmintonPlayer}>
              <Text style={styles.playerText}>
                {item[3].prenom} {item[3].nom}</Text>

            </View>
          </View>
        </View>
      </View>
    );
  } else {
    return null; // Ou renvoyer un composant de chargement ou un message d'erreur
  }
};
  goBackToList = () => {
    this.setState({ groupsCreated: false });
  };

  renderGroupItem = ({ item }) => {
    // Affichez les matchs pour chaque groupe sous forme de matchs de tennis
    return (
      <View style={styles.badmintonMatchContainer}>
        <View style={styles.badmintonPlayerColumn}>
          {item.slice(0, 2).map((match, index) => (
            <View key={index} style={styles.badmintonPlayer}>
              <Text>
                {match.prenom} {match.nom}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.vsText}>vs</Text>
        <View style={styles.badmintonPlayerColumn}>
          {item.slice(2, 4).map((match, index) => (
            <View key={index} style={styles.badmintonPlayer}>
              <Text>
                {match.prenom} {match.nom}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        {this.state.groupsCreated ? (
          // Afficher la liste des groupes une fois qu'ils sont créés
          <>
            <Text style={styles.title}>Groupes créés :</Text>
            <FlatList
              data={this.state.groups}
              renderItem={this.renderGroupItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <Button
              title="Revenir à la liste des matchs"
              onPress={this.goBackToList}
            />
          </>
        ) : (
          // Masquer le bouton de création de groupes dans l'application utilisateur
          <>
            <Text style={styles.title}>Liste des matchs :</Text>
            <FlatList
              data={this.state.matches}
              renderItem={this.renderMatchItem}
              keyExtractor={(item) => `${item.event_id}-${item.user_id}`}
            />
          </>
        )}
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5', // Couleur de fond blanc
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: 'black', // Couleur bleue pour le titre
  },
  matchItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#cee3ed', // Couleur de fond blanc pour chaque match
    borderRadius:10
  },
  dateText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#123539', // Couleur bleue pour la date
    fontWeight: "bold",
  },
  badmintonMatchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center", // Centre le texte "VS"
   borderRadius:15
  },
  badmintonPlayerColumn: {
    flex: 1,
    alignItems: "center",
    borderRadius:10
  },
  badmintonPlayer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#00887e', // Couleur de fond bleu pour chaque joueur
    borderRadius:10
  },
  playerText: {
    fontSize: 16,
    color: 'white', // Couleur bleue pour le nom du joueur
  },
  idText: {
    fontSize: 14,
    color: '#000000', // Couleur noire pour l'ID du joueur
  },
  vsText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    marginRight: 10,
    color: '#123539', // Couleur bleue pour le texte "VS"
  },
});
export default MatchScreen;
