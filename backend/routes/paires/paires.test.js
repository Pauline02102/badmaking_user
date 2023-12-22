const request = require('supertest');
const app = require('../../index');

describe("API Routes Paires", () => {
    test("POST /formerPaires - forme des paires", async () => {
        const participants = [
            { event_id: 3, user_id: 1, classement_double: 5 },
            { event_id: 3, user_id: 2, classement_double: 6 },
            { event_id: 3, user_id: 3, classement_double: 7},
            { event_id: 3, user_id: 4, classement_double: 3},
            { event_id: 3, user_id: 5, classement_double: 4 },
            { event_id: 3, user_id: 6, classement_double: 4 },
        ];
        
        const response = await request(app).post("/paires/formerPaires").send(participants);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message");
         
    });

    test("POST /formerPaireParClassementDouble - forme des paires par classement double", async () => {
        const participants = [
            { event_id: 3, user_id: 1, classement_double: 5 },
            { event_id: 3, user_id: 2, classement_double: 6 },
            { event_id: 3, user_id: 3, classement_double: 7},
            { event_id: 3, user_id: 4, classement_double: 3},
            { event_id: 3, user_id: 5, classement_double: 4 },
        ];
        
        
        const response = await request(app).post("/paires/formerPaireParClassementDouble").send(participants);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message");
         
    });

    test("GET /recupererPaires - récupère les paires", async () => {
        const response = await request(app).get("/paires/recupererPaires");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
         
    });

    test("GET /count/:eventId - récupère les paires pour un ID d'événement spécifique", async () => {
        const eventId = 3; 
        const response = await request(app).get(`/paires/count/${eventId}`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
         
    });
});
