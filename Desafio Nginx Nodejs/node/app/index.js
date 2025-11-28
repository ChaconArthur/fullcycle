const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Configuração da conexão MySQL
const dbConfig = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'app_db',
    connectionLimit: 10,
};
const pool = mysql.createPool(dbConfig);

const setupAndInsert = (res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return res.status(500).send('<h1>Erro ao conectar ao banco de dados.</h1>');
        }

        // 1. Cria a tabela 'people' se ela não existir
        const createTableQuery = 'CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL);';
        
        connection.query(createTableQuery, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err);
                connection.release();
                return res.status(500).send('<h1>Erro ao criar tabela.</h1>');
            }

            // 2. Insere um novo nome
            const name = "Pessoa " + crypto.randomBytes(4).toString('hex');
            const insertQuery = 'INSERT INTO people (name) VALUES (?)';
            
            connection.query(insertQuery, [name], (err) => {
                if (err) {
                    console.error('Erro ao inserir nome:', err);
                    connection.release();
                    return res.status(500).send('<h1>Erro ao inserir nome.</h1>');
                }

                // 3. Seleciona todos os nomes
                connection.query('SELECT name FROM people', (err, results) => {
                    connection.release(); 
                    
                    if (err) {
                        console.error('Erro ao listar nomes:', err);
                        return res.status(500).send('<h1>Erro ao listar nomes.</h1>');
                    }

                    // 4. Formata a resposta HTML
                    let htmlList = '<ul>';
                    results.forEach(person => {
                        htmlList += `<li>\${person.name}</li>`;
                    });
                    htmlList += '</ul>';

                    const responseHtml = `
                        <h1>Full Cycle Rocks!</h1>
                        <p>Novo registro: \${name}</p>
                        <hr>
                        <h2>Nomes Cadastrados:</h2>
                        \${htmlList}
                    `;
                    
                    res.send(responseHtml);
                });
            });
        });
    });
};

app.get('/', (req, res) => {
    setupAndInsert(res);
});

app.listen(port, () => {
    console.log(`Node.js listening on port ${port}`);
});