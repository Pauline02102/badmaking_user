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
      // Récupérez les données des participants qui ont cliqué sur "Oui" depuis le backend
      const response = await axios.get(
        "http://192.168.1.94:3030/ouiparticipation"
      );
      // Mélangez les matchs avant de les stocker dans l'état
      const shuffledMatches = _.shuffle(response.data);
      this.setState({ matches: shuffledMatches });
    } catch (error) {
      console.error("Erreur lors de la récupération des matchs", error);
    }
  };

  renderMatchItem = ({ item }) => {
    // Affichez les données du match pour chaque participant
    return (
      <View style={styles.matchItem}>
        <Text>Date :{item.date}</Text>
        <Text>Nom: {item.nom}</Text>
        <Text>Prenom: {item.prenom}</Text>
      </View>
    );
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
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  matchItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  badmintonMatchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center", // Centre le texte "vs"
  },
  badmintonPlayerColumn: {
    flex: 1,
    alignItems: "center",
  },
  badmintonPlayer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  vsText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    marginRight: 10,
  },
});

export default MatchScreen;
