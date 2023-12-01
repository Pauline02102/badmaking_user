import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";

const MatchGenerator = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchType, setMatchType] = useState("double"); // 'double' ou 'mixte'

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://192.168.1.6:3030/ouiparticipation');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPlayers(data);
      } else {
        console.error('La réponse de l\'API n\'est pas un tableau:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
    }
  };

  const generateRandomMatches = () => {
    let shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    let randomMatches = [];
  
    while (shuffledPlayers.length >= 4) {
      const match = shuffledPlayers.splice(0, 4);
      randomMatches.push([[match[0], match[1]], [match[2], match[3]]]);
    }
  
    setMatches(randomMatches);
  };
  
  

  const generateRankedMatches = () => {
    let sortedField = matchType === "double" ? "classement_double" : "classement_mixte";
  
    let rankedPlayers = [...players].sort((a, b) => {
      return (a[sortedField] || 13) - (b[sortedField] || 13);
    });
    let rankedMatches = [];
  
    while (rankedPlayers.length >= 4) {
      const match = rankedPlayers.splice(0, 4);
      rankedMatches.push([[match[0], match[1]], [match[2], match[3]]]);
    }
  
    setMatches(rankedMatches);
  };
  
  
    return (
        <View>
        <Button title="Double" onPress={() => setMatchType("double")} />
        <Button title="Mixte" onPress={() => setMatchType("mixte")} />
        <Button title="Générer Aléatoirement" onPress={generateRandomMatches} />
        <Button title="Générer par Classement" onPress={generateRankedMatches} />
        {matches.map((match, index) => (
      <View key={index}>
        <Text>{`Match ${index + 1}:`}</Text>
        <Text>{`Équipe 1: ${match[0].map(player => player.prenom).join(' et ')}`}</Text>
        <Text>{`Équipe 2: ${match[1].map(player => player.prenom).join(' et ')}`}</Text>
      </View>
    ))}
        </View>
    );  
};

export default MatchGenerator;
