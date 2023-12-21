const request = require('supertest');
const app = require('../index'); 

describe("API Routes Match", () => {


    test("GET /recupererMatchs - récupère les matchs créés", async () => {
        const response = await request(app).get("/match/recupererMatchs");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

    });
});
