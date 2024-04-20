const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// A criação da tabela não é mais necessária aqui

router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            "SELECT * FROM produto WHERE id = ?",
            [id],
            (error, rows) => {
                connection.release();

                if (error) {
                    return res.status(500).send({
                        error: error.message
                    });
                }

                res.status(200).send({
                    mensagem: "Aqui está a lista de Produtos",
                    produto: rows
                });
            }
        );
    });
});

router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM produto", (error, rows) => {
            connection.release();

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está a lista de Produtos",
                produto: rows
            });
        });
    });
});

router.post('/', (req, res, next) => {
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    // Validação dos campos
    let msg = [];
    if (!status || status.length < 1) {
        msg.push({ mensagem: "Status inválido! Deve ter pelo menos 1 caracteres." });
    }
    if (!descricao) {
        msg.push({ mensagem: "Descrição inválida! Você está cadastrando o mesmo Produto!" });
    }
    if (!estoque_minimo || isNaN(estoque_minimo)) {
        msg.push({ mensagem: "O campo Estoque Mínimo não pode estar vazio." });
    }
    if (!estoque_maximo || isNaN(estoque_maximo)) {
        msg.push({ mensagem: "O campo Estoque Máximo não pode estar vazio." });
    }

    if (msg.length > 0) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Produto!",
            erros: msg
        });
    }

    // Verifica se a descrição do produto já está cadastrada
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            "SELECT * FROM produto WHERE descricao = ?",
            [descricao],
            (error, produtoExistente) => {
                if (error) {
                    connection.release();
                    return res.status(500).send({
                        error: error.message
                    });
                }

                if (produtoExistente.length > 0) {
                    connection.release();
                    return res.status(400).send({
                        mensagem: "Descrição de produto já cadastrada."
                    });
                }

                // Insere o novo produto no banco de dados
                connection.query(
                    "INSERT INTO produto (status, descricao, estoque_minimo, estoque_maximo) VALUES (?, ?, ?, ?)",
                    [status, descricao, estoque_minimo, estoque_maximo],
                    (error, result) => {
                        connection.release();

                        if (error) {
                            return res.status(500).send({
                                error: error.message
                            });
                        }

                        res.status(201).send({
                            mensagem: "Produto cadastrado com sucesso!",
                            produto: {
                                id: result.insertId,
                                status: status,
                                descricao: descricao,
                                estoque_minimo: estoque_minimo,
                                estoque_maximo: estoque_maximo
                            }
                        });
                    }
                );
            }
        );
    });
});

router.put("/", (req, res, next) => {
    const { id, status, descricao, estoque_minimo, estoque_maximo } = req.body;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            "UPDATE produto SET status = ?, descricao = ?, estoque_minimo = ?, estoque_maximo = ? WHERE id = ?",
            [status, descricao, estoque_minimo, estoque_maximo, id],
            (error, result) => {
                connection.release();

                if (error) {
                    return res.status(500).send({
                        error: error.message
                    });
                }

                res.status(200).send({
                    mensagem: "Cadastro alterado com sucesso"
                });
            }
        );
    });
});

router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
  
        connection.query(
            "DELETE FROM produto WHERE id = ?",
            [id],
            (error, result) => {
                connection.release();

                if (error) {
                    return res.status(500).send({
                        error: error.message
                    });
                }

                res.status(200).send({
                    mensagem: "Produto deletado com sucesso!"
                });
            }
        );
    });
});

module.exports = router;
