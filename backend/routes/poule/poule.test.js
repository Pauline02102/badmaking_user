const request = require('supertest');
const app = require('../../index'); 

describe('Tests pour les routes des poules', () => {
    test('POST /creerPoules - Créer des poules', async () => {
        
        const response = await request(app)
            .post('/poule/creerPoules');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('messages');
      
    });

    test('GET /recupererPoules - Récupérer des poules et des informations des joueurs', async () => {
        const response = await request(app)
            .get('/poule/recupererPoules');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
     
        response.body.forEach(poule => {
            expect(poule).toHaveProperty('poule_id');
            expect(poule).toHaveProperty('poule');
            expect(poule).toHaveProperty('paire_id');
    
        });
    });

});
