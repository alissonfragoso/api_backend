const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");


db.run("CREATE TABLE IF NOT EXISTS produto (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, descricao TEXT UNIQUE, estoque_minimo INTEGER, estoque_maximo INTEGER)",
(createTableError) => {
    if (createTableError) {
        return false;
    }
});





router.get("/:id", (req, res, next) => {

    const { id } = req.params;
    db.all("SELECT * FROM produto WHERE id=?", [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            })
        }
        console.log(rows)
        res.status(200).send({
            messagem: "Aqui está a lista de Produtos",
            produto: rows
        })
    })

});

// -----------------------------------------------

router.get("/", (req, res, next) => {

    db.all("SELECT * FROM produto", (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            })
        }
        res.status(200).send({
            messagem: "Aqui está a lista de Produtos",
            produto: rows
        })
    })

});
// -----------------------------------------------------------------

// function validateDecricao(descricao) {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(String(descricao).toLowerCase());

// || !validateDecricao(descricao)  
// }

// -----------------------------------------------

router.post('/', (req, res, next) => {
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    // Validação dos campos
    let msg = [];
    if (!status || status.length < 1) {
        msg.push({ mensagem: "Status vaziu! Deve ter pelo menos 1 caracteres." });
    }
    if (!descricao) {
        msg.push({ mensagem: "Descrição inválido!, Voçê está cadastrando o mesmo Produto!" });
    }
    if (!estoque_minimo || isNaN(estoque_minimo)) {
        msg.push({ mensagem: "O campo Estoque Máximo não pode estar vazio." });
    }
    if (!estoque_maximo || isNaN(estoque_maximo)) {
        msg.push({ mensagem: "O campo Estoque Máximo não pode estar vazio." });
    }

    if (msg.length > 0) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Produto!.",
            erros: msg
        });
    }

    // Verifica se a descrição do produto já está cadastrada
    db.get(`SELECT * FROM produto WHERE descricao = ?`, [descricao], (error, produtoExistente) => {

        if (error) {
            return res.status(500).send({
                error: error.message,
                response: null
            });
        }

        if (produtoExistente) {
            return res.status(400).send({
                mensagem: "Descrição de produto já cadastrada."
            });
        }


        // Insere o novo produto no banco de dados
        db.run(`INSERT INTO produto (status, descricao, estoque_minimo, estoque_maximo) VALUES (?, ?, ?, ?)`,
            [status, descricao, estoque_minimo, estoque_maximo],

            function (insertError) {
                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message,
                        response: null
                    });
                }
                res.status(201).send({
                    mensagem: "Produto cadastrado com sucesso!",
                    produto: {
                        id: this.lastID,
                        status: status,
                        descricao: descricao,
                        estoque_minimo: estoque_minimo,
                        estoque_maximo: estoque_maximo
                    }
                });
            })
    });

});

// --------------------------------------------------------------------------



router.put("/", (req, res, next) => {
    const { id, status, descricao, estoque_minimo, estoque_maximo } = req.body;

    db.run("UPDATE produto SET status = ?, descricao = ?, estoque_minimo = ?, estoque_maximo = ? WHERE id = ?",
        [status, descricao, estoque_minimo, estoque_maximo, id], function (error) {

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Cadastro alterado com sucesso",
            });
        });
});
// -----------------------------------------------

router.delete("/:id", (req, res, next) => {

    const { id } = req.params;
    db.run("DELETE  FROM produto WHERE  id = ?", id, (error,) => {

        if (error) {
            return res.status(500).send({
                error: error.message
            })
        }
        res.status(200).send({
            messagem: "Produto deletado com suscesso!!",

        })
    });



})

// -----------------------------------------------
module.exports = router;