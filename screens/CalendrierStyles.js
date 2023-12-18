import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eventContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  participationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  attendanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  matchItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#cee3ed', // Couleur de fond blanc pour chaque match
    borderRadius: 10
  },
  badmintonPlayer: {
    //borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#00887e', // Couleur de fond bleu pour chaque joueur
    borderRadius: 10
  },
  legendButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
  },
  legendButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "#214353",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  buttonClose: {
    backgroundColor: "#559ea2",
    borderRadius: 20,
    padding: 7,
    elevation: 2,
    marginTop: 15

  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  legendTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: 'bold',
    color: "#e4ebef"
  },
  legendText: {
    textAlign: "center",
    marginVertical: 5,
    color: "#e4ebef"
  },
  eventItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#467c86",
    marginBottom: 5,
  },
  eventTitle2: {
    fontSize: 20, // Augmenter la taille de la police
    fontWeight: 'bold', // Rendre le texte en gras
    color: "#123e53", // Choisir une couleur qui correspond au thème
    marginBottom: 10, // Ajouter une marge en bas
    marginTop: 10, // Ajouter une marge en haut
    textAlign: 'center', // Centrer le texte
  },
  eventInfo: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
  participationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  }, confirmationMessage: {
    fontSize: 16,
    color: 'green', // Couleur de texte de confirmation
    marginVertical: 10, // Espacement vertical
    textAlign: 'center', // Centrez le texte
  },
  modalViewPlayers: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)' // Arrière-plan semi-transparent pour l'ombrage
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%', // Largeur du modal basée sur la taille de l'écran
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  pairItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Couleur de fond pour chaque élément de paire
    borderRadius: 10,
    padding: 10,
    marginVertical: 8
  },
  pairText: {
    fontSize: 16
  },
  closeButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18
  },
  closeButton: {
    backgroundColor: '#D9D9D9', // Couleur de fond du bouton Close
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20
  }
});

export default styles;