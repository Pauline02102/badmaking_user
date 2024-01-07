const request = require('supertest');
const app = require('../../index');

describe('Login Route Tests', () => {
    test('POST /login - connecte l\'utilisateur', async () => {
        const response = await request(app)
            .post('/user_tokens/login')
            .send({ email: 'johndoe@example.com', password: 'password123' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('message', 'Connexion réussie.');
    });
});




