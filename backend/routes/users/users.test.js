const request = require('supertest');
const app = require('../index.js');

describe("API Routes Users", () => {
    test('POST /postusers - Créer un nouvel utilisateur', async () => {
        const newUser = {
            nom: 'pauf',
            prenom: 'John',
            role: 'joueur',
            email: 'nv@.cofm',
            password: 'password123',
            classementSimple: 5,
            classementDouble: 5,
            classementMixte: 5
        };
        
        const response = await request(app)
            .post('/users/postusers')
            .send(newUser);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'Inscription réussie.');
        expect(response.body).toHaveProperty('prenom', newUser.prenom);

        expect(response.body).not.toHaveProperty('password');
    });

});
