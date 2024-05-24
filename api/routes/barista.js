const express = require('express');
const router = express.Router();
const sql = require('msnodesqlv8');

// Connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=MPP-COFFEE;Trusted_Connection=yes;';
router.get('/all', (req, res, next) => {
    const query = `
        SELECT b.barista_id, b.barista_name, b.barista_age, COUNT(c.coffee_id) AS coffee_count
        FROM Baristas b
        LEFT JOIN Coffees c ON b.barista_id = c.barista_id
        GROUP BY b.barista_id, b.barista_name, b.barista_age;
    `;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.length === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: 'No baristas found' });
            }
            const baristasWithCoffeeCount = result.map(barista => ({
                id: barista.barista_id,
                name: barista.barista_name,
                age: barista.barista_age,
                coffee_count: barista.coffee_count
            }));
            //console.log(baristasWithCoffeeCount);
            res.status(200).json(baristasWithCoffeeCount);
            conn.close();
        });
    });
});


// Get a single barista by ID
router.get('/:id',(req, res, next) => {
    const baristaId = req.params.id;
    const query = `SELECT * FROM Baristas WHERE barista_id = ${baristaId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.length === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Barista with ID ${baristaId} not found` });
            }
            res.status(200).json(result[0]);
            conn.close();
        });
    });
});

// Add a new barista
router.post('/', (req, res, next) => {
    const { name, age } = req.body;
    if (!name || !age) {
        return res.status(400).json({ error: 'Name and age are required' });
    }

    const maxIdQuery = 'SELECT MAX(barista_id) AS maxId FROM Baristas';
    
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
            
            const nextId = result[0].maxId + 1;
            const insertQuery = `INSERT INTO Baristas (barista_id, barista_name, barista_age) VALUES (${nextId}, '${name}', ${age})`;
            
            conn.query(insertQuery, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                res.status(201).json({ message: 'Barista added successfully' });
    
                conn.close();
            });
        });
    });
});

// Update an existing barista
router.put('/:id',(req, res, next) => {
    const baristaId = req.params.id;
    const { name, age } = req.body;
    if (isNaN(baristaId) || parseInt(baristaId) <= 0) {
        return res.status(400).json({ error: 'Invalid barista ID' });
    }

    const query = `UPDATE Baristas SET barista_name = '${name}', barista_age = ${age} WHERE barista_id = ${baristaId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.rowsAffected === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Barista with ID ${baristaId} not found` });
            }
            res.status(200).json({ message: `Barista with ID ${baristaId} updated successfully` });
            conn.close();
        });
    });
});

// Delete a barista by ID
router.delete('/:id',(req, res, next) => {
    const baristaId = req.params.id;
    const query = `DELETE FROM Baristas WHERE barista_id = ${baristaId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.rowsAffected === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Barista with ID ${baristaId} not found` });
            }
            
            res.status(200).json({ message: `Barista with ID ${baristaId} deleted successfully` });
            conn.close();
        });
    });
});

module.exports = router;
