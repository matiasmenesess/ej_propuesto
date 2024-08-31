const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 8001;

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the users database.');
});
app.use(express.json());
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
      res.json({
        "message": "success",
        "data": rows
      });
    }
  });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (!row) {
      res.status(404).send('User not found');
    } else {
      res.json({
        "message": "success",
        "data": row
      });
    }
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).send('Name and email are required');
  } else {
    const sql = 'INSERT INTO users(name, email) VALUES (?, ?)';
    db.run(sql, [name, email], function(err) {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(201).send({ id: this.lastID, name, email });
      }
    });
  }
});

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  db.run(sql, [name, email, id], function(err) {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (this.changes === 0) {
      res.status(404).send('User not found');
    } else {
      res.status(200).send({ id, name, email });
    }
  });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (this.changes === 0) {
      res.status(404).send('User not found');
    } else {
      res.status(204).send();
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
