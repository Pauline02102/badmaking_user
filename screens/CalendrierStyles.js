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
        borderRadius:10
      },
      badmintonPlayer: {
        //borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        marginBottom: 8,
        backgroundColor: '#00887e', // Couleur de fond bleu pour chaque joueur
        borderRadius:10
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
        marginTop:15
    
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
        color:"#e4ebef"
      },
      legendText: {
        textAlign: "center",
        marginVertical: 5,
        color:"#e4ebef"
      },
  });
  
  export default styles;