import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

class MatchScreen extends Component {
  state = {
    groupedParticipants: {}, // Stocke les participants groupés par date et event_id
  };

  componentDidMount() {
    this.fetchMatches();
  }

  fetchMatches = async () => {
    try {
      const response = await axios.get('http://192.168.1.6:3030/ouiparticipation');
      const data = response.data;
      
      // Grouper les participants par date
      const groupedByDate = _.groupBy(data, participant =>
        moment(participant.date).format('YYYY-MM-DD')
      );
      
      // Pour chaque date, grouper les participants par event_id, puis créer des sous-groupes de 4
      const groupedParticipants = _.mapValues(groupedByDate, participantsByDate => {
        const participantsGroupedByEvent = _.groupBy(participantsByDate, 'event_id');
        return _.flatMap(participantsGroupedByEvent, participants => _.chunk(participants, 4));
      });

      this.setState({ groupedParticipants });
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs', error);
    }
  };

  renderMatchGroup = ({ item }) => {
    // Chaque item ici est un sous-groupe de 4 participants ou moins
    return (
      <View style={styles.groupContainer}>
        <View style={styles.teamContainer}>
          <Text style={styles.playerText}>Équipe 1</Text>
          {item.slice(0, 2).map((player, index) => (
            <Text key={index} style={styles.playerText}>
              {player.prenom} {player.nom}
            </Text>
            
          ))}
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.teamContainer}>
          <Text style={styles.playerText}>Équipe 2</Text>
          {item.slice(2, 4).map((player, index) => (
            <Text key={index} style={styles.playerText}>
              {player.prenom} {player.nom}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  render() {
    const { groupedParticipants } = this.state;
    const dates = Object.keys(groupedParticipants).sort(); // Trier les dates

    return (
      <View style={styles.container}>
        {dates.map(date => (
          <View key={date} style={styles.dateContainer}>
            <Text style={styles.dateText}>{date}</Text>
            <FlatList
              data={groupedParticipants[date]}
              renderItem={this.renderMatchGroup}
              keyExtractor={(item, index) => `${date}-${index}`}
            />
          </View>
        ))}
      </View>
    );
  }
}

// Styles à définir selon vos besoins
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5', // Couleur de fond blanc
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#123539', // Couleur bleue pour la date
    fontWeight: "bold",
  },
  groupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  teamContainer: {
  backgroundColor :"#00887e",
  borderRadius: 5,
  padding : 15,
  margin :15
  },
  playerText: {
    fontSize: 16,
    color: 'black', // Couleur bleue pour le nom du joueur
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


