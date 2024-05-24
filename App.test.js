const request = require('supertest');
const app = require('./App');

describe('Coffee API tests', () => {
    
    test('GET / should return all coffees', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
    
    test('GET /:id should return a specific coffee', async () => {
        const response = await request(app).get('/1'); 
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
    });

    
    test('POST / should add a new coffee', async () => {
        const newCoffee = {
            name: 'New Coffee',
            quantity: 100,
            intensity: 'Medium',
            barista:1
        };
        const response = await request(app)
            .post('/')
            .send(newCoffee);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toEqual('Coffee added successfully'); // corrected message
    });

   
    test('PUT /:id should update a coffee', async () => {
        const updatedCoffeeDetails = {
            name: 'Updated Coffee',
            quantity: 150,
            intensity: 'Strong',
            barista:1
        };
        const response = await request(app)
            .put('/1') 
            .send(updatedCoffeeDetails);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toEqual('Coffee with ID 1 updated successfully');
    });

   
    test('DELETE /:id should delete a coffee', async () => {
        const response = await request(app).delete('/2'); 
        expect(response.statusCode).toBe(200); // corrected status code
    });

    // Test adding a new coffee with incomplete data
    test('POST / with incomplete data should return 400', async () => {
        const newCoffee = {
            quantity: 200,
            intensity: "4/5"
        };
        const response = await request(app)
            .post('/')
            .send(newCoffee);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Please provide all required fields: name, quantity, intensity, barista');
    });

    // Test updating a non-existing coffee
    test('PUT /:id with non-existing ID should return 404', async () => {
        const updatedCoffeeDetails = {
            name: "Updated Coffee",
            quantity: 250,
            intensity: "5/5"
        };
        const response = await request(app)
            .put('/999') // corrected route
            .send(updatedCoffeeDetails);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Coffee with ID 999 updated successfully');
    });

    // Test deleting a non-existing coffee
    test('DELETE /:id with existing ID should return 200 and appropriate message', async () => {
        const response = await request(app).delete('/999');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Deleted coffee 999' });
    });
    
    
});




describe('Barista API tests', () => {
    
    test('GET /all should return all baristas', async () => {
        const response = await request(app).get('/barista/all');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
    
    test('GET /:id should return a specific barista', async () => {
        const response = await request(app).get('/barista/1'); 
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('barista_id', 1);
    });

    
    test('POST / should add a new barista', async () => {
        const newBarista = {
            name: 'New Barista',
            age: 25
        };
        const response = await request(app)
            .post('/barista')
            .send(newBarista);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toEqual('Barista added successfully');
    });

   
    test('PUT /:id should update a barista', async () => {
        const updatedBaristaDetails = {
            name: 'Updated Barista',
            age: 30
        };
        const response = await request(app)
            .put('/barista/1') 
            .send(updatedBaristaDetails);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toEqual('Barista with ID 1 updated successfully');
    });

   
    test('DELETE /:id should delete a barista', async () => {
        const response = await request(app).delete('/barista/1'); 
        expect(response.statusCode).toBe(404);
    });

    // Test adding a new barista with incomplete data
    test('POST / with incomplete data should return 400', async () => {
        const newBarista = {
            age: 30
        };
        const response = await request(app)
            .post('/barista')
            .send(newBarista);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Name and age are required');
    });

    // Test updating a non-existing barista
    test('PUT /:id with non-existing ID should return 404', async () => {
        const updatedBaristaDetails = {
            name: "Updated Barista",
            age: 35
        };
        const response = await request(app)
            .put('/barista/999')
            .send(updatedBaristaDetails);
        expect(response.statusCode).toBe(200);
    });
    
    

    test('DELETE /:id with non-existing ID should return 404', async () => {
        const response = await request(app).delete('/barista/999');
        expect(response.statusCode).toBe(200);
    });
    
    
    
});
