const sql = require('msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=MPP-COFFEE;Trusted_Connection=yes;';
const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNjQ4NjM3NCwiZXhwIjoxNzE2NDg5OTc0fQ.WP01CWZbsn65zkz66S7BgFL_87X10B4fxAE5heUy1zY';
const publicKey = 'ioana';

try {
  const decoded = jwt.verify(token, publicKey);
  console.log('Token is valid:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

sql.open(connectionString, (err, conn) => {
  if (err) {
    console.error('Error occurred:', err);
    return;
  }

  const query = 'SELECT * FROM Baristas';

  conn.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
    } else {
      console.log(results);
    }

    conn.close();
  });
});

