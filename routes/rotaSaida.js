const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// -----------------------------------------------

// A criação da tabela não é mais necessária, pois você já deve tê-la criado no MySQL

router.get(`/`, (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            `SELECT 
                saida.id as id, 
                saida.id_produto as id_produto,
                saida.quantidade as quantidade,
                saida.data_saida as data_saida,
                produto.descricao as descricao,
                saida.valor_unitario as valor_unitario
            FROM saida
            INNER JOIN produto ON saida.id_produto = produto.id`,
            (error, rows) => {
                connection.release(); // Libere a conexão

                if (error) {
                    return res.status(500).send({
                        error: error.message
                    });
                }

                res.status(200).send({
                    messagem: "Aqui está a lista de Saida",
                    saida: rows
                });
            }
        );
    });
});
router.post('/', (req, res) => {
    const { id_produto, quantidade, valor_unitario, data_saida } = req.body;

    // Verificar se o id_produto existe na tabela estoque
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }


        // O produto existe no estoque, então podemos continuar com a inserção
        connection.query(
            "INSERT INTO `saida`( `id_produto`, `quantidade`, `valor_unitario`, `data_saida`) VALUES (?,?,?,?)",
            [id_produto, quantidade, valor_unitario, data_saida],
            (error, result) => {
                connection.release(); // Liberar a conexão

                if (error) {
                    console.error(error.message);
                    return res.status(500).send({
                        error: error.message,
                        response: null
                    });
                }

                //atualizarEstoque(id_produto, quantidade, valor_unitario);

                res.status(201).send({
                    mensagem: "Saída Registrada!",
                    saida: {
                        id: result.insertId,
                        id_produto: id_produto,
                        quantidade: quantidade,
                        valor_unitario: valor_unitario,
                        data_saida: data_saida
                    }
                });
            }
        );
    }
    );
});


// A rota PUT está comentada, não há necessidade de modificá-la para MySQL

// -----------------------------------------------

router.delete(`/:id`, (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            `DELETE FROM saida WHERE id = ?`,
            [id],
            (error, result) => {
                connection.release(); // Libere a conexão

                if (error) {
                    return res.status(500).send({
                        error: error.message
                    });
                }

                res.status(200).send({
                    mensagem: "Saida deletada com sucesso!"
                });
            }
        );
    });
});

// A função atualizarEstoque permanece inalterada

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
                    quantidade = parseFloat(quantidade) - parseFloat(quantidade);

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
// function atualizarEstoque(id_produto, quantidade) {
//     mysql.getConnection((error, connection) => {
//         if (error) {
//             console.error("Erro ao conectar ao MySQL:", error);
//             return false;
//         }

//         connection.query(
//             `SELECT * FROM estoque WHERE id_produto = ?`,
//             [id_produto],
//             (error, rows) => {
//                 if (error) {
//                     console.error("Erro ao executar consulta SELECT:", error);
//                     connection.release();
//                     return false;
//                 }

//                 if (rows.length > 0) {
//                     let quantidadeAtual = rows[0].quantidade;
//                     let novaQuantidade = parseFloat(quantidadeAtual) - parseFloat(quantidade);

//                     if (novaQuantidade < 0) {
//                         console.error("Erro: Quantidade insuficiente em estoque para esta saída.");
//                         connection.release();
//                         return false;
//                     }

//                     connection.query(
//                         "UPDATE estoque SET quantidade = ? WHERE id_produto = ?",
//                         [novaQuantidade, id_produto],
//                         (error) => {
//                             if (error) {
//                                 console.error("Erro ao executar consulta UPDATE:", error);
//                                 connection.release();
//                                 return false;
//                             }

//                             connection.release();
//                         }
//                     );
//                 } else {
//                     console.error("Erro: Produto não encontrado no estoque.");
//                     connection.release();
//                     return false;
//                 }
//             }
//         );
//     });
// }

module.exports = router;
