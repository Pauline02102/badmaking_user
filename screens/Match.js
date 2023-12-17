import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

const Match = () => {
  const [participants, setParticipants] = useState([]);
  const [paires, setPaires] = useState([]);
  const [response, setResponse] = useState('');
  const [poules, setPoules] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedPoule, setSelectedPoule] = useState('all');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [reportVictory, setReportVictory] = useState(null);

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultModalMessage, setResultModalMessage] = useState('');


  useEffect(() => {
    // Définition de l'intervalle pour exécuter les fetch toutes les 30 secondes
    const intervalId = setInterval(() => {
      fetchLoggedInUserInfo();
      fetchParticipations();
      fetchPaires();
      fetchPoules();
      fetchMatches();
    }, 2000);

    // Nettoyage de l'intervalle lorsque le composant est démonté
    return () => clearInterval(intervalId);
  }, []); // Utilisation d'un tableau vide de dépendances

  const CustomModal = ({ isVisible, message, onConfirm, onCancel, confirmText, cancelText, onClose }) => {
    return (
      <Modal isVisible={isVisible}>
        <View style={styles.modalContent}>
          {/* Ajout de la croix pour fermer */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onConfirm}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { marginLeft: 20 }]} onPress={onCancel}>
              <Text style={styles.buttonText}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  const fetchParticipations = async () => {
    try {
      const url = 'http://192.168.1.6:3030/ouiparticipation';
      const response = await fetch(url);
      const data = await response.json();

      setParticipants(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des participations:', error);
    }
  };

  const fetchPaires = async () => {
    try {
      const url = 'http://192.168.1.6:3030/recupererPaires';
      const response = await fetch(url);
      const data = await response.json();
      setPaires(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paires:', error);
    }
  };

  const handleCreerPaires = async () => {
    console.log("participants", participants);
    try {
      const url = 'http://192.168.1.6:3030/formerPaires';
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participants),
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      console.log("Données reçues du serveur:", data);
    } catch (error) {
      console.error('Erreur lors de la création des paires:', error);
    }
  };

  const handleCreerPairesParClassement = async () => {
    console.log("participants", participants);
    try {
      const url = 'http://192.168.1.6:3030/formerPaireParClassementDouble';
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participants),
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      console.log("Données reçues du serveur:", data);
    } catch (error) {
      console.error('Erreur lors de la création des paires:', error);
    }
  };


  const handleCreerPoules = async () => {
    try {
      const url = 'http://192.168.1.6:3030/creerPoules';
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));

    } catch (error) {
      console.error('Erreur lors de la création des poules:', error);
      setResponse('Erreur lors de la création des poules');
    }
  };


  const fetchPoules = async () => {
    try {
      const url = 'http://192.168.1.6:3030/recupererPoules';
      const response = await fetch(url);
      const data = await response.json();
      // Créer un ensemble unique d'identifiants de poule
      const poulesUniques = [...new Set(data.map(item => item.poule))];
      setPoules(poulesUniques);
    } catch (error) {
      console.error('Erreur lors de la récupération des poules:', error);
    }
  };

  async function fetchEventStatuses(eventIds) {
    try {
      const url = `http://192.168.1.6:3030/getEventStatus?eventIds=${encodeURIComponent(JSON.stringify(eventIds))}`;
      const response = await fetch(url);
      const statusesArray = await response.json();

      // Convert the array to a map/object for easy access
      let statusesMap = {};
      statusesArray.forEach(item => {
        statusesMap[item.id] = item.status;
      });

      return statusesMap;
    } catch (error) {
      console.error('Error fetching event statuses:', error);
    }
  }

  const fetchLoggedInUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('page match : Token non trouvé');
        return;
      }
      const response = await fetch('http://192.168.1.6:3030/get-user-info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setLoggedInUser(data.user);
      } else {
        console.error('Raté pour fetch user info:', data.message);
      }
    } catch (error) {
      console.error('Erreur pour fetch les info des users:', error);
    }
  };

  const renderPlayerName = (userPrenom, userNom, doubleInfo, matchId) => {
    const isUser = loggedInUser && userPrenom === loggedInUser.prenom && userNom === loggedInUser.nom;

    const playerName = (
      <Text style={isUser ? styles.highlightedUser : {}}>
        {userPrenom} {userNom}
      </Text>
    );

    const doubleInfoText = (
      <Text style={styles.doubleText}>{" ("}{doubleInfo}{")"}</Text>
    );

    return isUser ? (
      <TouchableOpacity
        onPress={() => handlePlayerPress(matchId, userPrenom, userNom)}
        style={styles.playerNameTouchable}
      >
        {playerName}
        {doubleInfoText}
      </TouchableOpacity>
    ) : (
      <>
        {playerName}
        {doubleInfoText}
      </>
    );
  };



  const handleCreerMatchs = async () => {
    try {
      const url = 'http://192.168.1.6:3030/creerMatchs';
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      fetchMatches();
      await fetchLoggedInUserInfo();
    } catch (error) {
      console.error('Erreur lors de la création des matchs:', error);
      setResponse('Erreur lors de la création des matchs');
    }
  };
  // Fonction pour récupérer les matchs
  const fetchMatches = async () => {
    try {
      const url = 'http://192.168.1.6:3030/recupererMatchs';
      const response = await fetch(url);
      const data = await response.json();
      //console.log('Match data:', data);
      setMatches(data); // Stocke les données des matchs dans l'état

    } catch (error) {
      console.error('Erreur lors de la récupération des matchs:', error);
    }
  };

  const handleToutCreer = async (eventId) => {
    try {
      const response = await fetch(`http://192.168.1.6:3030/getEventStatus/${eventId}`);
      const status = await response.json()
      if (status === 'Random') {
        await handleCreerPaires();
        console.log("Événement créé aléatoirement");
      } else if (status === 'par niveau') {
        await handleCreerPairesParClassement();
        console.log("Événement créé par classement");
      }

      await handleCreerPoules();
      await handleCreerMatchs();
    } catch (error) {
      console.error('Error in handleToutCreer: ', error);
    }
  };



  //Groupe les matchs par poule
  const groupMatchesByPoule = (matches) => {
    return matches.reduce((acc, match) => {
      if (!acc[match.poule_id]) {
        acc[match.poule_id] = [];
      }
      acc[match.poule_id].push(match);
      return acc;
    }, {});
  };

  const reportMatchResult = async (matchId, userId, didWin) => {
    try {
      const body = {
        match_id: matchId,
        user_id: userId,
        victoire: didWin ? 1 : 0,
        defaite: didWin ? 0 : 1
      };
      const response = await fetch('http://192.168.1.6:3030/report-match-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        // match succes
        console.log(data.message);
      } else {
        // erreur
        console.error(data.message);
      }
    } catch (error) {
      console.error("erreur lors de l'encodage des resultats du match ", error);
    }
  };
  const formatDayAndMonth = (dateString) => {
    const options = { day: 'numeric', month: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };
  // Fonction de rendu pour le tableau de matchs
  const renderMatchTable = () => {

    const matchesGroupedByPoule = groupMatchesByPoule(matches);
    const poulesToShow = selectedPoule === 'all' ? Object.keys(matchesGroupedByPoule) : [selectedPoule];
    // Fonction pour formater la date au format jour et mois




    return poulesToShow.map((pouleId) => (


      <View key={pouleId} style={styles.pouleTableContainer}>
        <Text style={styles.pouleTitle}>Poule {pouleId}</Text><Text></Text>
        {/* En-tête du tableau */}
        <View style={styles.headerRow}>

          <Text style={styles.cell1equipe1}>EQUIPE 1</Text>
          <Text style={styles.vscellaudessu}>VS</Text>
          <Text style={styles.cell1equipe1}>EQUIPE 2</Text>
          <Text style={styles.dateCellhaut}>Date</Text>

        </View>

        {/* Lignes du tableau */}
        {matchesGroupedByPoule[pouleId].map((match, index) => {

          return (

            <View key={match.match_id} style={[styles.row, index % 2 ? styles.rowEven : styles.rowOdd]}>
              <Text style={styles.cell}>

                {renderPlayerName(match.user1_prenom_paire1, match.user1_nom_paire1, match.user1_double, match.match_id)}
                {'\n'}
                {renderPlayerName(match.user2_prenom_paire1, match.user2_nom_paire1, match.user2_double, match.match_id)}
              </Text>
              <Text style={[styles.cell, styles.vsCell]}>VS</Text>
              <Text style={styles.cell}>
                {renderPlayerName(match.user1_prenom_paire2, match.user1_nom_paire2, match.user3_double, match.match_id)}
                {'\n'}
                {renderPlayerName(match.user2_prenom_paire2, match.user2_nom_paire2, match.user4_double, match.match_id)}
              </Text>
              <Text style={styles.dateCellbas}>{formatDayAndMonth(match.event_date)}{match.event_time}</Text>


            </View>
          );

        })}

      </View>

    ));
  };
  const handlePlayerPress = (matchId, prenom, nom) => {
    if (!loggedInUser || (prenom !== loggedInUser.prenom || nom !== loggedInUser.nom)) {
      console.error("Erreur : L'utilisateur connecté ne correspond pas.");
      return;
    }

    fetch(`http://192.168.1.6:3030/check-match-result?match_id=${matchId}&user_id=${loggedInUser.id}`)
      .then(response => response.json())
      .then(data => {
        if (data.resultExists) {
          setModalMessage(
            <Text >
              Tu as déjà enregistré un résultat pour ce match en tant que
              <Text style={{ color: data.victory ? 'green' : 'red' }}>
                {data.victory ? " victoire" : " défaite"}
              </Text>
              . Veux-tu le modifier ?
            </Text>
          );
          setCurrentMatchId(matchId);
          setReportVictory(!data.victory); // Inverse l'état actuel de la victoire
          setModalVisible(true);
        } else {
          // Utilise le Modal personnalisé pour demander si l'utilisateur a gagné ou perdu
          setResultModalMessage(`As-tu gagné ce match ?`);
          setCurrentMatchId(matchId);
          setResultModalVisible(true);
        }
      })
      .catch(error => {
        console.error("Erreur lors de la vérification du résultat du match", error);
      });
  };

  //affichage avec un picker
  const renderPoulePicker = () => {
    return (
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPoule}
          onValueChange={(itemValue, itemIndex) => setSelectedPoule(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Toutes les poules" value="all" />
          {poules.map((pouleId, index) => (
            <Picker.Item key={index} label={`Poule ${pouleId}`} value={pouleId} />
          ))}
        </Picker>
      </View>
    );
  };

  return (

    <ScrollView style={styles.container}>

      {renderPoulePicker()}
      <View>
        <Text style={styles.subtitle}>Matchs</Text>
        {matches.map((match, index) => (
          <View key={match.match_id}>
            {/* ... (le reste de votre code pour afficher les détails du match) */}
          </View>
        ))}
        <Text style={styles.dateCellbas}>
          Date: {formatDayAndMonth(matches[0].event_date)} - Heure: {matches[0].event_time}
        </Text>
      </View>


      <View >

        {renderMatchTable()}


      </View>

      <Button
        title="Créer matchs"
        onPress={handleToutCreer}
        color="purple"
      />
      <CustomModal
        isVisible={modalVisible}
        message={modalMessage}
        onConfirm={() => {
          reportMatchResult(currentMatchId, loggedInUser.id, reportVictory);
          setModalVisible(false);
        }}
        onCancel={() => setModalVisible(false)}
        confirmText="Oui"
        cancelText="Non"
        onClose={() => setModalVisible(false)}
      />

      <CustomModal
        isVisible={resultModalVisible}
        message={resultModalMessage}
        onConfirm={() => {
          reportMatchResult(currentMatchId, loggedInUser.id, true);
          setResultModalVisible(false);
        }}
        onCancel={() => {
          reportMatchResult(currentMatchId, loggedInUser.id, false);
          setResultModalVisible(false);
        }}
        confirmText="Oui"
        cancelText="Non"
        onClose={() => setResultModalVisible(false)}
      />


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  paireContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  paireText: {
    fontSize: 16,
    marginBottom: 5,
  },
  pouleContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  pouleText: {
    fontSize: 16,
    marginBottom: 5,
  },
  table: {
    borderWidth: 0.7, // Définit l'épaisseur de la bordure
    borderColor: '#121f2d', // Une nuance de bleu foncé pour la bordure
    borderRadius: 4,
  },
  headerRow: {
    // Style pour l'en-tête du tableau
    flexDirection: 'row',
    backgroundColor: '#007AFF', // Couleur d'arrière-plan pour l'en-tête
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderColor: '#121f2d',
  },
  headerCell: {
    // Style pour la cellule de l'en-tête
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texte blanc pour l'en-tête
    textAlign: 'center',
  },
  row: {
    // Style pour la ligne du tableau
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',// Ligne séparatrice plus claire
  },
  rowEven: {
    backgroundColor: '#f9f9f9', // Une couleur bleu clair pour les lignes paires
  },
  rowOdd: {
    backgroundColor: '#FFFFFF', // Une couleur blanche pour les lignes impaires
  },
  cell: {
    flex: 1.5, // Augmente la largeur des colonnes "Paire 1" et "Paire 2"
    padding: 10,
    textAlign: 'center',

  },
  cell1equipe1: {
    flex: 1.5, // Augmente la largeur des colonnes "Paire 1" et "Paire 2"
    padding: 10,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    paddingLeft: 10
  },
  pouleCell: {
    flex: 0.5, // Réduit la largeur de la colonne "Poule"
    padding: 10,
    textAlign: 'center',
  },
  vsCell: {
    // Style spécifique pour la cellule "VS"
    flex: 0.3,
    fontWeight: 'bold',
    color: '#FF9500',
    textAlign: 'center',
  },
  vscellaudessu: {
    flex: 0.4,
    padding: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15
  },
  pouleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,  // Ajout d'une marge en bas si nécessaire
    textAlign: 'center',

  },
  pickerContainer: {
    backgroundColor: '#f2f2f2', // Fond clair
    borderRadius: 10, // Coins arrondis
    borderWidth: 1, // Bordure fine
    borderColor: '#dcdcdc', // Couleur de la bordure
    shadowColor: '#000', // Couleur de l'ombre
    shadowOpacity: 0.2, // Opacité de l'ombre
    shadowRadius: 3, // Rayon de l'ombre
    shadowOffset: { width: 0, height: 2 }, // Décalage de l'ombre

  },
  picker: {
    color: '#333', // Couleur de la police
    fontSize: 16, // Taille de la police
    marginTop: -80
  },
  pouleTableContainer: {
    marginBottom: 20, // Ajoute une marge en bas de chaque tableau de poule
    borderWidth: 1.5, // Épaisseur de la bordure
    borderColor: '#12597e', // Couleur de la bordure
    borderRadius: 5, // Rayon de la bordure pour les coins arrondis
    padding: 5, // Espace intérieur pour ne pas coller le contenu à la bordure


  },
  doubleText: {
    fontStyle: 'italic', // Style italique pour le texte entre parenthèses
    color: '#3498db', // Couleur personnalisée pour le texte entre parenthèses
  },
  dateCellhaut: {
    flex: 0.5, // Régle la largeur de la cellule de date en fonction de vos besoins
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',// Style de police en gras pour la date
    marginRight: 10
  },
  dateCellbas: {
    flex: 0.5, // Régle la largeur de la cellule de date en fonction de vos besoins
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    // Style de police en gras pour la date
  },
  playerNameTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: -6.5,
    paddingLeft: 15
  },
  highlightedUser: {
    color: 'red',
    fontWeight: 'bold',

  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 40,
  },
  modalMessage: {
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#deeded',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center', // Centre le texte dans le bouton
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Espacement égal entre les boutons
    marginTop: 20,
  },
  buttonText: {
    color: '#124a50',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },


});

export default Match;