const request = require('supertest');
const app = require('../index.js'); 

describe("API Routes Event", () => {
    test("GET /calendar - récupère tous les événements", async () => {
        const response = await request(app).get("/event/calendar");
        expect(response.statusCode).toBe(200);
      
    });

    test("POST /postcalendar - crée un nouvel événement", async () => {
        const newEvent = {
            title: "Test Event",
            user_id: 1,
            status: "active",
            terrain_id: 1,
            date: "2023-08-01",
            heure: "10:00:00"
        };
        const response = await request(app).post("/event/postcalendar").send(newEvent);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id");

    });

    test("PUT /modifier/:eventId - met à jour un événement", async () => {
        const updatedEvent = {
            title: "Updated Event",
            status: "updated",
            date: "2023-08-02",
            heure: "11:00:00"
        };
        const response = await request(app).put("/event/modifier/3").send(updatedEvent);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id", 3);
     
    });
});
