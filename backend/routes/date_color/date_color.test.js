const request = require('supertest');
const app = require('../../index');

describe('Tests pour les routes des couleurs des dates', () => {
    test('POST /associateColorToDate - Associer une couleur à une date', async () => {
        const postData = {
            date: '2023-01-01',
            color: 'red'
        };
        const response = await request(app)
            .post('/date_color/associateColorToDate')
            .send(postData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message');
      
    });

    test('GET /getColorForDate/:date - Récupérer la couleur pour une date', async () => {
        const response = await request(app)
            .get('/date_color/getColorForDate/2023-01-01');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('color');
        
    });

    test('GET /getAllDateColors - Récupérer toutes les couleurs des dates', async () => {
        const response = await request(app)
            .get('/date_color/getAllDateColors');

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
   
    });


});
