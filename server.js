const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const cors = require('cors');
const port = 3001;
require('dotenv').config();
const sendGridMail = require('@sendgrid/mail');
app.use(cors());


sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configuração da conexão ao MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'arog1003',
    database: 'APAEDoacoes'
});

// Conectar ao MySQL
connection.connect(err => {
    if (err) {
        console.error('Erro conectando ao MySQL: ' + err.stack);
        return;
    }
    console.log('Conectado ao MySQL como ID ' + connection.threadId);
});

app.use(express.json()); // parsing json
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get('/esqueceu-senha', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/esqueceuSenha.html'));
});

app.get('/doacao', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/doacao.html'));
});

// Endpoint para cadastro
app.post('/register', (req, res) => {
    const { name, email, phone, password, cpf, date } = req.body;

    // Checando se email já existe
    const checkEmailQuery = 'SELECT * FROM users WHERE Email = ?';
    connection.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro checando email' });
            return;
        }

        if (results.length > 0) {
            // Email já existe
            res.status(409).json({ error: 'Email já cadastrado' });
            return;
        }

        // Email não existe
        const query = 'INSERT INTO users (Nome, Email, Fone, Senha, CPF, dataNascimento) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(query, [name, email, phone, password, cpf, date], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro cadastrando usuário' });
                return;
            }
            res.json({ message: 'Usuário cadastrado com sucesso', userId: results.insertId });
        });
    });
});

// Endpoint para login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Checando se email e senha batem com usuário já cadastrado
    const query = 'SELECT * FROM users WHERE Email = ? AND Senha = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro checando valores' });
            return;
        }

        if (results.length === 0) {
            // Usuário não encontrado
            res.status(401).json({ error: 'Email ou senha inválidos' });
            return;
        }

        // Usuário logado com sucesso
        const user = results[0];
        res.json({ message: 'Login feito com sucesso', userId: user.id });
    });
});

// Endpoint para doacao
app.post('/doacao', (req, res) => {
    const { valor, Email } = req.body;
    const query1 = 'SELECT * FROM users WHERE Email = ?';
    connection.query(query1, [Email], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao verificar email' });
            return;
        }
        else if (results.length === 0){
            // Email não encontrado
            res.status(401).json({ error: 'Email inválido' });
            return;
        }
        else{
            const query = 'INSERT INTO doacao (valor, dataDoacao, Email) values (?, curdate(), ?)';
            connection.query(query, [valor, Email], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao salvar doacao' });
                return;
            }
            res.json({ message: 'Doacao salva com sucesso' });
    });
        }
    })
    
});

// funcao pra gerar o codigo de verificacao
function codigoaleatorio() {
    // Gerar um código de 6 dígitos aleatório
    const min = 100000; // O menor número de 6 dígitos (100000)
    const max = 999999; // O maior número de 6 dígitos (999999)
    const codigoAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;

    return codigoAleatorio;
}

// guardar o codigo de verificacao
const codigoverificacao = codigoaleatorio();

app.post('/enviar-email', async (req, res) => {
    const { email } = req.body;

    try {
        // checar se email já está registrado
        const query = 'SELECT * FROM users WHERE Email = ?';
        const results = await new Promise((resolve, reject) => {
            connection.query(query, [email], (err, results) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });

        if (results.length === 0) {
            // Email não encontrado
            res.status(401).json({ error: 'Email inválido' });
            return;
        }

        // Mandar email com código
        console.log("Código aleatório de 6 dígitos:", codigoverificacao);

        const message = {
            to: email,
            from: "pedrogmaximo@gmail.com",
            subject: "Teste para email de autenticação",
            text: "Teste para API SendGrid",
            html: `<strong>Seu código de verificação APAE-SCS é ${codigoverificacao}</strong>`,
        };

        await sendGridMail.send(message);
        console.log("Email enviado com sucesso!");
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});


// Endpoint para verificar codigo
app.post('/verificar-codigo', (req, res) => {
    const { codigo } = req.body;

    if (codigoverificacao == codigo) {
        console.log("verificado com sucesso");
        res.status(200).json({ success: true });
    } else {
        console.log("falha ao verificar");
        res.status(401).json({ success: false, message: "Invalid verification code" });
    }
});

// Endpoint para atualizar senha
app.post('/atualizar-senha', (req, res) => {
    const { usuario, senha } = req.body;

    // Checando se email bate com usuário já cadastrado
    const query = 'SELECT * FROM users WHERE email = ?';
    console.log(usuario);
    console.log(senha);
    connection.query(query, [usuario, senha], (err, results) => {
        if (err) {
            console.log("erro procurando email");
            console.error(err);
            res.status(500).json({ success: false, error: 'Erro checando valores' });
            return;
        }
        if (results.length === 0) {
            // Usuário não encontrado
            console.log("Email nao encontrado ao atualizar");
            res.status(401).json({ success: false, error: 'Email ou senha inválidos' });
            return;
        }

        const query = 'UPDATE users SET senha = ? WHERE email = ?'
        connection.query(query, [senha, usuario], (err, results) => {
            if (err) {
                console.log("erro atualizando senha")
                console.error(err);
                res.status(500).json({ error: 'Erro atualizando senha' });
                return;
            }
            console.log("Senha atualizada com sucesso");
            res.json({ message: 'Senha atualizada com sucesso' });
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
