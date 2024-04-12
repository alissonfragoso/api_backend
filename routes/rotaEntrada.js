const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Criação da tabela de entrada no MySQL
mysql.getConnection((error, connection) => {
    if (error) {
        console.error("Erro ao obter conexão do pool:", error);
        return;
    }

    connection.query(`CREATE TABLE IF NOT EXISTS entrada (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_produto INT,
        quantidade FLOAT,
        valor_unitario FLOAT,
        data_entrada DATE
    )`, (error) => {
        connection.release();
        if (error) {
            console.error("Erro ao criar a tabela de entrada:", error);
        }
    });
});

// Rota para listar todas as entradas
router.get(`/`, (req, res, next) => {
    mysql.query(`SELECT 
        entrada.id as id,
        entrada.id_produto as id_produto,
        entrada.quantidade as quantidade,
        entrada.data_entrada as data_entrada,
        produto.descricao as descricao,
        entrada.valor_unitario as valor_unitario
    FROM entrada 
    INNER JOIN produto ON entrada.id_produto = produto.id`, (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Aqui está a lista de Entrada",
            entrada: rows
        });
    });
});

// Rota para registrar uma nova entrada
router.post(`/`, (req, res) => {
    const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

    mysql.query(`INSERT INTO entrada (id_produto, quantidade, valor_unitario, data_entrada) VALUES (?, ?, ?, ?)`,
        [id_produto, quantidade, valor_unitario, data_entrada],
        (error, result) => {
            if (error) {
                console.error("Erro ao inserir entrada:", error);
                return res.status(500).send({
                    error: error.message
                });
            }
            
            //atualizarEstoque(id_produto, quantidade, valor_unitario);

            res.status(201).send({
                mensagem: "Entrada Registrada!",
                entrada: {
                    id: result.insertId,
                    id_produto: id_produto,
                    quantidade: quantidade,
                    valor_unitario: valor_unitario,
                    data_entrada: data_entrada
                }
            });
        });
});

// Rota para deletar uma entrada pelo ID
router.delete(`/:id`, (req, res, next) => {
    const { id } = req.params;

    mysql.query(`DELETE FROM entrada WHERE id = ?`, [id], (error, result) => {
        if (error) {
            console.error("Erro ao deletar entrada:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            messagem: "Entrada deletada com sucesso!"
        });
    });
});

// Função para atualizar o estoque
function atualizarEstoque(id_produto, quantidade, valor_unitario) {

    mysql.getConnection((error, connection) => {
        if (error) {
            console.error("Erro ao conectar ao MySQL:", error);
            return false;
        }

        connection.query(
            `SELECT * FROM estoque WHERE id_produto = ?`,
            [id_produto],
            (error, rows) => {
                if (error) {
                    console.error("Erro ao executar consulta SELECT:", error);
                    connection.release();
                    return false;
                }

                if (rows.length > 0) {
                    let quantidade = rows[0].qtde;
                    quantidade = parseFloat(quantidade) + parseFloat(quantidade);

                    connection.query(
                        "UPDATE estoque SET quantidade = ?, valor_unitario = ? WHERE id_produto = ?",
                        [quantidade, valor_unitario, id_produto],
                        (error) => {
                            if (error) {
                                console.error("Erro ao executar consulta UPDATE:", error);
                                connection.release();
                                return false;
                            }

                            connection.release();
                        }
                    );
                } else {
                    connection.query(
                        "INSERT INTO estoque (id_produto, quantidade, valor_unitario) VALUES (?, ?, ?)",
                        [id_produto, quantidade, valor_unitario],
                        (error) => {
                            if (error) {
                                console.error("Erro ao executar consulta INSERT:", error);
                                connection.release();
                                return false;
                            }

                            connection.release();
                        }
                    );
                }
            }
        );
    });
}
module.exports = router;
