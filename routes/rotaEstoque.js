const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

db.run("(CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto, qtde REAL, valor_unitario REAL )", (createTableError) => {
    if (createTableError) {
        return false;
    }
});


// -----------------------------------------------


router.get(`/`, (req, res, next) => {

    db.all(`
    SELECT 
    estoque.id as id,
    estoque.qtde as qtde,
    estoque.valor_unitario,
    produto.id as id_produto,
    produto.descricao as descricao
    FROM estoque INNER JOIN produto ON estoque.id_produto = produto.id; `, (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            })
        }
        res.status(200).send({
            messagem: "Aqui está a lista de Estoque",
            estoque: rows
        })
    })

});


// Verifica se a descrição do produto já está cadastrada
router.post(`/`, (req, res) => {
    const { id_produto, qtde, valor_unitario, } = req.body;
    console.log(req.body)

    // Inserir os dados da entrada na nova tabela_
    db.run(`INSERT INTO estoque (id_produto, qtde, valor_unitario,) VALUES (?, ?, ?, ?)`,
        [id_produto, qtde, valor_unitario],
        function (insertError) {
            if (insertError) {

                console.log(insertError)

                return res.status(500).send({
                    error: insertError.message,
                    response: null
                });
            }
            // atualizarEstoque(id_produto, qtde , valor_unitario);
            
            res.status(201).send({
                mensagem: "Estoque Registrado!",
                estoque: {
                    id: this.lastID,
                    id_produto: id_produto,
                    qtde: qtde,
                    valor_unitario: valor_unitario,
                   
                }
            });
        });
});

// --------------------------------------------------------------------------



// router.put("/", (req, res, next) => {
//     const { id, status, descricao, estoque_minimo, estoque_maximo } = req.body;

//     db.run("UPDATE produto SET status = ?, descricao = ?, estoque_minimo = ?, estoque_maximo = ? WHERE id = ?",
//         [status, descricao, estoque_minimo, estoque_maximo, id], function (error) {

//             if (error) {
//                 return res.status(500).send({
//                     error: error.message
//                 });
//             }
//             res.status(200).send({
//                 mensagem: "Cadastro alterado com sucesso",
//             });
//         });
// });

// -----------------------------------------------



// function atualizarEstoque(id_produto, qtde, valor_unitario) {
//     db.all(`SELECT * FROM estoque WHERE id_produto = ?`, [id_produto], (error, rows) => {
//         if (error) {
//             return false;
//         }
//         if (rows.length > 0) {
//             let quantidade = rows[0].qtde;
//             quantidade = parseFloat(quantidade) + parseFloat(qtde);

//             db.run("UPDATE estoque SET qtde=?, valor_unitario=? WHERE id_produto=?",
//                 [quantidade, id_produto, valor_unitario], (error) => {
//                     if (erro) {
//                         return false
//                     }

//                 });
//         } else 
//             db.serialize(() => {
                
//                 const insertEstoque = db.prepare("INSERT INFO estoque(id_produto, qtde, valor_unitario) VALUES(?,?,?)");
//                 insertEstoque.run(id_produto, qtde, valor_unitario);
//                 insertEstoque.finalize()

//             })
//         }
//     });
// }

module.exports = router;