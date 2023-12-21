const request = require('supertest');
const app = require('../index.js'); 

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


describe('User Info Route Tests', () => {
    test('GET /get-user-info - récupère les informations de l\'utilisateur', async () => {
        const token = '44a695441aba028a0bfad4baef91e6d7a53914d6064a481538437c18adedf60d6fd8c40816ad8580966f4d99af2fac82'; 
        const response = await request(app)
            .get('/user_tokens/get-user-info')
            .set('Authorization', `Bearer ${token}`); // Remplacez par un token valide pour les tests

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('user');
        // Ajoutez d'autres assertions si nécessaire
    });
});

describe('Logout Route Tests', () => {
    test('POST /logout - déconnecte l\'utilisateur', async () => {
        const token = '44a695441aba028a0bfad4baef91e6d7a53914d6064a481538437c18adedf60d6fd8c40816ad8580966f4d99af2fac82'; 
        const response = await request(app)
            .post('/user_tokens/logout')
            .set('Authorization', `Bearer ${token}`);  // Remplacez par un token valide pour les tests

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Déconnexion réussie');
    });
});



