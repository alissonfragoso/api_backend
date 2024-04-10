const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool; // Certifique-se de fornecer o pool do MySQL corretamente

router.get("/", (req, res, next) => {
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`
            SELECT 
                estoque.id AS id,
                estoque.quantidade AS quantidade,
                estoque.valor_unitario AS valor_unitario,
                produto.id AS id_produto,
                produto.descricao AS descricao
            FROM estoque
            INNER JOIN produto ON estoque.id_produto = produto.id;
        `, (queryError, rows) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao executar consulta:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Aqui está a lista de Estoque",
                estoque: rows
            });
        });
    });
});

router.post("/", (req, res) => {
    const { id_produto, quantidade, valor_unitario } = req.body;

    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`INSERT INTO estoque (id_produto, quantidade, valor_unitario) VALUES (?, ?, ?)`, [id_produto, quantidade, valor_unitario], (queryError, result) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao inserir no estoque:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(201).send({
                message: "Estoque Registrado!",
                estoque: {
                    id: result.insertId,
                    id_produto: id_produto,
                    quantidade: quantidade,
                    valor_unitario: valor_unitario
                }
            });
        });
    });
});

module.exports = router;
