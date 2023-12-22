const request = require('supertest');
const app = require('../../index');

describe('Tests pour les routes de participation au jeu libre', () => {
    test('POST /participationJeuLibre/:userId - enregistre la participation d\'un utilisateur', async () => {
        const userId = 7;
        const postData = {
            participation: "Oui",
            date: "2023-01-01",
            heure: "10:00"
        };
        const response = await request(app)
            .post(`/participation_jeu/participationJeuLibre/${userId}`)
            .send(postData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message');

    });

    test('GET /ouiparticipationjeulibre/:selectedDate - récupère les participations pour une date spécifique', async () => {
        const selectedDate = '2023-01-01';
        const response = await request(app)
            .get(`/participation_jeu/ouiparticipationjeulibre/${selectedDate}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);

    });


});
