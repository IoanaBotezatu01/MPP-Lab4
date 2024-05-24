const express = require('express');
const router = express.Router();
const sql = require('msnodesqlv8');
require('dotenv').config()


// Connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=MPP-COFFEE;Trusted_Connection=yes;';


router.get('/', (req, res, next) => {
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const query = `
            SELECT c.coffee_id, c.coffee_name, c.coffee_quantity, c.coffee_intensity, b.barista_name
            FROM Coffees c
            INNER JOIN Baristas b ON c.barista_id = b.barista_id
        `;

        conn.query(query, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const coffeeArray = results.map(coffee => ({
                id: coffee.coffee_id,
                name: coffee.coffee_name,
                quantity: coffee.coffee_quantity,
                intensity: coffee.coffee_intensity,
                barista: coffee.barista_name
            }));
           // console.log(coffeeArray);
            res.status(200).json(coffeeArray);
            conn.close();
        });
    });
});


// Get a specific coffee by ID with its corresponding barista name
router.get('/:id', (req, res, next) => {
    const coffeeId = req.params.id;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        const query = `
            SELECT c.coffee_id, c.coffee_name, c.coffee_quantity, c.coffee_intensity, b.barista_name
            FROM Coffees c
            INNER JOIN Baristas b ON c.barista_id = b.barista_id
            WHERE c.coffee_id = ${coffeeId}
        `;
        
        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (result.length === 0) {
                return res.status(404).json({ error: `Coffee with ID ${coffeeId} not found` });
            }
            
            const coffee = {
                id: result[0].coffee_id,
                name: result[0].coffee_name,
                quantity: result[0].coffee_quantity,
                intensity: result[0].coffee_intensity,
                barista: result[0].barista_name
            };
            res.status(200).json(coffee);
            conn.close();
        });
    });
});


/// Add a new coffee
router.post('/', (req, res, next) => {
    const { name, quantity, intensity, barista} = req.body;
    
   
    const maxIdQuery = 'SELECT MAX(coffee_id) AS maxId FROM Coffees';
    
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        conn.query(maxIdQuery, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!name || !quantity || !intensity || !barista) {
                return res.status(400).json({ error: 'Please provide all required fields: name, quantity, intensity, barista' });
            }
            
            const nextId = result[0].maxId + 1;
            
            const insertQuery = `INSERT INTO Coffees (coffee_id, coffee_name, coffee_quantity, coffee_intensity, barista_id) VALUES (${nextId}, '${name}', ${quantity}, '${intensity}',${barista})`;
            
            conn.query(insertQuery, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                res.status(201).json({ message: 'Coffee added successfully' });
                
                conn.close();
            });
        });
    });
});

// Update an existing coffee
router.put('/:id', (req, res, next) => {
    const coffeeId = req.params.id;
    const { name, quantity, intensity } = req.body;
    const query = `UPDATE Coffees SET coffee_name = '${name}', coffee_quantity = ${quantity} WHERE coffee_id = ${coffeeId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.rowsAffected === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Coffee with ID ${coffeeId} not found` });
            }
            
            res.status(200).json({ message: `Coffee with ID ${coffeeId} updated successfully` });
            conn.close();
        });
    });
});

// Delete a coffee by ID
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        //console.log(id);
        const query = `DELETE FROM Coffees WHERE coffee_id = ${id}`;

        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.rowsAffected === 0) {
                return res.status(404).json({ message: 'Coffee not found' });
            }

            res.status(200).json({ message: `Deleted coffee ${id}` });
            conn.close();
        });
    });
});


module.exports = router;