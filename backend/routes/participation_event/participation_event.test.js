const request = require('supertest');
const app = require('../../index'); 

describe('Tests pour les routes de participation aux événements', () => {


    test('GET /ouiparticipation - récupère les participations "Oui" pour tous les événements', async () => {
        const response = await request(app).get('/participation_event/ouiparticipation');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      
    });

    test('GET /ouiparticipation/:event_id - récupère les participations "Oui" pour un événement spécifique', async () => {
        const eventId = 8; 
        const response = await request(app).get(`/participation_event/ouiparticipation/${eventId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
       
    });

    test('GET /participantcount/:event_id - compte le nombre de participants à un événement', async () => {
        const eventId = 8; 
        const response = await request(app).get(`/participation_event/participantcount/${eventId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('participant_count');
 
    });


});
