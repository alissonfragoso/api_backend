const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool; // Importa a pool do MySQL
const jwt = require('jsonwebtoken'); // Para geração de token JWT
const bcrypt = require('bcrypt');

// Criar a tabela se não existir (aqui estou assumindo que você já criou a tabela 'usuario' no MySQL)
// mysql.query("CREATE TABLE IF NOT EXISTS usuario (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), email VARCHAR(255) UNIQUE, senha VARCHAR(255))", (createTableError) => {
//     if (createTableError) {
//         console.error("Erro ao criar tabela:", createTableError);
//     }
// });

router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.query("SELECT * FROM usuario WHERE id=?", [id], (error, rows) => {
        if (error) {
            console.error("Erro na consulta:", error);
            return res.status(500).send({
                error: error.message
            });
        }

        console.log(rows);

        res.status(200).send({
            mensagem: "Aqui está a lista de Usuários",
            usuario: rows
        });
    });
});

router.get("/", (req, res, next) => {
    mysql.query("SELECT * FROM usuario", (error, rows) => {
        if (error) {
            console.error("Erro na consulta:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Aqui está a lista de Usuários",
            usuario: rows
        });
    });
});

router.post('/login', (req, res, next) => {
    const { email, senha } = req.body;

    mysql.query(`SELECT * FROM usuario WHERE email = ?`, [email], (error, usuario) => {
        if (error) {
            console.error("Erro na consulta:", error);
            return res.status(500).send({
                error: error.message
            });
        }

        if (!usuario || !usuario[0]) {
            return res.status(401).send({
                mensagem: "Usuário não encontrado."
            });
        }

        bcrypt.compare(senha, usuario[0].senha, (bcryptError, result) => {
            if (bcryptError) {
                console.error("Erro ao comparar senhas:", bcryptError);
                return res.status(500).send({
                    error: bcryptError.message
                });
            }

            if (!result) {
                return res.status(401).send({
                    mensagem: "Senha incorreta."
                });
            }

            // Gerar token JWT
            const token = jwt.sign({ id: usuario[0].id, email: usuario[0].email }, 'secreto', { expiresIn: '1h' });

            res.status(200).send({
                mensagem: "Login bem sucedido.",
                token: token
            });
        });
    });
});

router.post('/', (req, res, next) => {
    const { nome, email, senha } = req.body;

    // Validação dos campos
    let msg = [];
    if (!nome || nome.length < 3) {
        msg.push({ mensagem: "Nome inválido! Deve ter pelo menos 3 caracteres." });
    }
    if (!email || !validateEmail(email)) {
        msg.push({ mensagem: "E-mail inválido!" });
    }
    if (!senha || senha.length < 6) {
        msg.push({ mensagem: "Senha inválida! Deve ter pelo menos 6 caracteres." });
    }
    if (msg.length > 0) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar usuário.",
            erros: msg
        });
    }

    // Verifica se o email já está cadastrado
    mysql.query(`SELECT * FROM usuario WHERE email = ?`, [email], (error, usuarioExistente) => {
        if (error) {
            console.error("Erro na consulta:", error);
            return res.status(500).send({
                error: error.message
            });
        }

        if (usuarioExistente && usuarioExistente[0]) {
            return res.status(400).send({
                mensagem: "E-mail já cadastrado."
            });
        }

        // Hash da senha antes de salvar no banco de dados
        bcrypt.hash(senha, 10, (hashError, hashedPassword) => {
            if (hashError) {
                console.error("Erro ao fazer hash da senha:", hashError);
                return res.status(500).send({
                    error: hashError.message
                });
            }

            // Insere o novo usuário no banco de dados
            mysql.query(`INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)`, [nome, email, hashedPassword], function (insertError) {
                if (insertError) {
                    console.error("Erro ao inserir usuário:", insertError);
                    return res.status(500).send({
                        error: insertError.message
                    });
                }
                res.status(201).send({
                    mensagem: "Cadastro criado com sucesso!",
                    usuario: {
                        id: this.insertId,
                        nome: nome,
                        email: email
                    }
                });
            });
        });
    });
});

router.put("/", (req, res, next) => {
    const { id, nome, email, senha } = req.body;

    mysql.query(" UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id = ?",
        [nome, email, senha, id], function (error) {

            if (error) {
                console.error("Erro na atualização:", error);
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Cadastro alterado com sucesso",
            });

        });

});

router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.query("DELETE FROM usuario WHERE id = ?", id, (error) => {
        if (error) {
            console.error("Erro ao deletar usuário:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Cadastro deletado com sucesso!!",
        });
    });
});

// Função para validar formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

module.exports = router;
