import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CreerPaires = () => {
  const [participants, setParticipants] = useState([]);
  const [paires, setPaires] = useState([]);
  const [response, setResponse] = useState('');
  const [poules, setPoules] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [selectedPoule, setSelectedPoule] = useState('all');
  

  useEffect(() => {
    fetchParticipations();
    fetchPaires();
    fetchPoules();
    fetchMatches();
  }, [],300);

  const fetchParticipations = async () => {
    try {
      const url = 'http://192.168.1.6:3000/ouiparticipation';
      const response = await fetch(url);
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des participations:', error);
    }
  };

  const fetchPaires = async () => {
    try {
      const url = 'http://192.168.1.6:3000/recupererPaires';
      const response = await fetch(url);
      const data = await response.json();
      setPaires(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paires:', error);
    }
  };

  const handleCreerPaires = async () => {
    try {
      const url = 'http://192.168.1.6:3000/formerPaires';
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participants),
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      fetchPaires(); // Récupérer les paires après leur création
    } catch (error) {
      console.error('Erreur lors de la création des paires:', error);
      setResponse('Erreur lors de la création des paires');
    }
  };

  const handleCreerPoules = async () => {
    try {
      const url = 'http://192.168.1.6:3000/creerPoules'; 
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      //  également appeler fetchPaires() ici si nécessaire
    } catch (error) {
      console.error('Erreur lors de la création des poules:', error);
      setResponse('Erreur lors de la création des poules');
    }
  };

  
  const fetchPoules = async () => {
    try {
      const url = 'http://192.168.1.6:3000/recupererPoules';
      const response = await fetch(url);
      const data = await response.json();
       // Créer un ensemble unique d'identifiants de poule
      const poulesUniques = [...new Set(data.map(item => item.poule))];
      setPoules(poulesUniques);
    } catch (error) {
      console.error('Erreur lors de la récupération des poules:', error);
    }
  };

  
  const handleCreerMatchs = async () => {
    try {
      const url = 'http://192.168.1.6:3000/creerMatchs'; // Remplacez avec l'URL de votre serveur
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      // Vous pouvez également ajouter une fonction pour récupérer les matchs ici si nécessaire
    } catch (error) {
      console.error('Erreur lors de la création des matchs:', error);
      setResponse('Erreur lors de la création des matchs');
    }
  };
// Fonction pour récupérer les matchs
  const fetchMatches = async () => {
    try {
      const url = 'http://192.168.1.6:3000/recupererMatchs';
      const response = await fetch(url);
      const data = await response.json();
      setMatches(data); // Stocker les données des matchs dans l'état
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs:', error);
    }
  };
  //créer les trois fonction d'un coup
  const handleToutCreer = async () => {
    await handleCreerPaires(); // Première étape : créer les paires
    await handleCreerPoules(); // Deuxième étape : créer les poules
    await handleCreerMatchs(); // Troisième étape : créer les matchs
  };

  //Grouper les matchs par poule
  const groupMatchesByPoule = (matches) => {
    return matches.reduce((acc, match) => {
      if (!acc[match.poule_id]) {
        acc[match.poule_id] = [];
      }
      acc[match.poule_id].push(match);
      return acc;
    }, {});
  };

  
  // Fonction de rendu pour le tableau de matchs
  const renderMatchTable = () => {
    const matchesGroupedByPoule = groupMatchesByPoule(matches);
    const poulesToShow = selectedPoule === 'all' ? Object.keys(matchesGroupedByPoule) : [selectedPoule];
    return poulesToShow.map((pouleId) =>(
      
      <View key={pouleId}  style={styles.pouleTableContainer}>
         <Text style={styles.pouleTitle}>Poule {pouleId}</Text>
        {/* En-tête du tableau */}
        <View style={styles.headerRow}>
      
          <Text style={styles.cell1equipe1}>EQUIPE 1</Text>
          <Text style={styles.vscellaudessu}>VS</Text> 
          <Text style={styles.cell1equipe1}>EQUIPE 2</Text>
        </View>

        {/* Lignes du tableau */}
        {matchesGroupedByPoule[pouleId].map((match, index)=> (
          <View key={match.match_id} style={[styles.row, index % 2 ? styles.rowEven : styles.rowOdd]}>
          
            <Text style={styles.cell}>
            {match.user1_prenom_paire1} {match.user1_nom_paire1}{'\n'}
            {match.user2_prenom_paire1} {match.user2_nom_paire1}
            </Text>
            <Text style={[styles.cell, styles.vsCell]}>VS</Text> 
            <Text style={styles.cell}>
            {match.user1_prenom_paire2} {match.user1_nom_paire2}{'\n'}
            {match.user2_prenom_paire2} {match.user2_nom_paire2}</Text>
    
          </View>
        ))}
      </View>
    ));
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

    
    {/* Boutons pour créer des matchs */}

    <Button
    title="Créer matchs"
    onPress={handleToutCreer}
    color="purple" // Ou toute autre couleur de votre choix
    />

    {renderPoulePicker()}
    <Text style={styles.subtitle}>Matchs </Text>   
      
      <View >
      
        {renderMatchTable()}

      </View>

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
  cell1equipe1:{
    flex: 1.5, // Augmente la largeur des colonnes "Paire 1" et "Paire 2"
    padding: 10,
    textAlign: 'center',
    color: '#FFFFFF', 
    fontWeight: 'bold',
    paddingLeft:10
  },
  pouleCell: {
    flex: 0.5, // Réduit la largeur de la colonne "Poule"
    padding: 10,
    textAlign: 'center',
  },
  vsCell: {
    // Style spécifique pour la cellule "VS"
    flex: 0.3, // Utilisez une valeur de flex plus petite pour la colonne "VS"
    fontWeight: 'bold',
    color: '#FF9500',
    textAlign: 'center',
  },
  vscellaudessu:{
    flex: 0.4,
    padding: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft:15
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
    marginTop:-80
  },
  pouleTableContainer: {
    marginBottom: 20, // Ajoutez une marge en bas de chaque tableau de poule
    borderWidth: 1.5, // Épaisseur de la bordure
    borderColor: '#12597e', // Couleur de la bordure
    borderRadius: 5, // Rayon de la bordure pour les coins arrondis
    padding: 5, // Espace intérieur pour ne pas coller le contenu à la bordure
  
  
  },
});

export default CreerPaires;
