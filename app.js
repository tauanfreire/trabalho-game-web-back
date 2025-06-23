import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Teste de rota simples
app.get("/", async (req, res) => {
  try {
    const SQL = "SELECT * FROM paises WHERE capital = 'Brasília'";
    const [results] = await pool.query(SQL);
    res.status(200).json(results);
  } catch (error) {
    console.error("Erro na rota '/'", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Buscar todos os jogos
app.get("/jogo", async (req, res) => {
  try {
    const SQL = "SELECT * FROM jogos";
    const [results] = await pool.query(SQL);
    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Buscar jogo por título
app.get("/jogo/:titulo", async (req, res) => {
  try {
    const { titulo } = req.params;
    const SQL = `SELECT id FROM jogos WHERE titulo = ?`;
    const [results] = await pool.query(SQL, [titulo]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogo por título:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Buscar jogo por ID (para jogar)
app.get("/jogar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `SELECT * FROM jogos WHERE id = ?`;
    const [results] = await pool.query(SQL, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Buscar conteúdo de termo-definição por jogo_id
app.get("/termo-definicao/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `SELECT * FROM jogo_termo_definicao WHERE jogo_id = ?`;
    const [results] = await pool.query(SQL, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Termos-Definições não encontrados" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar termos-definições:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Buscar conteúdo de item-categoria por jogo_id
app.get("/item-categoria/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = `SELECT * FROM jogo_item_categoria WHERE jogo_id = ?`;
    const [results] = await pool.query(SQL, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Itens-Categorias não encontrados" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar itens-categorias:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Criar novo jogo
app.post("/jogo", async (req, res) => {
  try {
    const { titulo, descricao, criador_id, tipo_jogo } = req.body;

    const SQL = `INSERT INTO jogos (titulo, descricao, criador_id, tipo_jogo) VALUES (?, ?, ?, ?)`;
    const [results] = await pool.query(SQL, [
      titulo,
      descricao,
      criador_id,
      tipo_jogo,
    ]);

    res.status(201).json({ message: "Jogo cadastrado com sucesso", insertId: results.insertId });
  } catch (error) {
    console.error("Erro ao cadastrar o jogo:", error);
    res.status(500).json({ error: "Erro ao cadastrar o jogo" });
  }
});

// ✅ Inserir itens-categorias
app.post("/item-categoria", async (req, res) => {
  try {
    const { conteudo, jogo_id } = req.body;

    if (!Array.isArray(conteudo) || conteudo.length === 0) {
      return res.status(400).json({ error: "Conteúdo inválido." });
    }

    const SQL = `INSERT INTO jogo_item_categoria (jogo_id, item, categoria) VALUES (?, ?, ?)`;

    for (const { item, categoria } of conteudo) {
      await pool.query(SQL, [jogo_id, item, categoria]);
    }

    res.status(201).json({ message: "Itens-Categorias cadastrados com sucesso!" });
  } catch (error) {
    console.error("Erro ao inserir itens-categorias:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Inserir termos-definições
app.post("/termo-definicao", async (req, res) => {
  try {
    const { conteudo, jogo_id } = req.body;

    if (!Array.isArray(conteudo) || conteudo.length === 0) {
      return res.status(400).json({ error: "Conteúdo inválido." });
    }

    const SQL = `INSERT INTO jogo_termo_definicao (jogo_id, termo, definicao) VALUES (?, ?, ?)`;

    for (const { termo, definicao } of conteudo) {
      await pool.query(SQL, [jogo_id, termo, definicao]);
    }

    res.status(201).json({ message: "Termos-Definições cadastrados com sucesso!" });
  } catch (error) {
    console.error("Erro ao inserir termos-definições:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ✅ Atualizar tipo_jogo de um jogo existente
app.put("/jogo/tipo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_jogo } = req.body;

    const SQL = `UPDATE jogos SET tipo_jogo = ? WHERE id = ?`;
    const [results] = await pool.query(SQL, [tipo_jogo, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    res.json({ message: "Tipo do jogo atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar tipo do jogo:", error);
    res.status(500).json({ error: "Erro ao atualizar o jogo." });
  }
});

// ✅ Atualizar tipo_jogo de um jogo existente
app.put("/usuario/alterar-senha/", async (req, res) => {
  try {
    const {email, novaSenha} = req.body;

    const SQL = `UPDATE usuarios SET senha = ? WHERE email = ?`;
    console.log(`SENHA: ${novaSenha}`)
    console.log(`EMAIL: ${email}`)
    const [results] = await pool.query(SQL, [novaSenha, email]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.json({ message: "Tipo do jogo atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar tipo do jogo:", error);
    res.status(500).json({ error: "Erro ao atualizar o jogo." });
  }
});

// // Buscar dados para jogar o jogo "arrastar-soltar"
// app.get('/jogos/:id/jogar/arrastar-soltar', async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Aqui vamos buscar os dados relacionados ao jogo, por exemplo,
//     // buscar os itens e categorias do jogo com id informado.
//     // Supondo que esses dados estejam na tabela jogo_item_categoria.

//     const SQL = 'SELECT item, categoria FROM jogo_item_categoria WHERE jogo_id = ?';
//     const [results] = await pool.query(SQL, [id]);

//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Dados para arrastar e soltar não encontrados' });
//     }

//     // Retornar os dados no formato esperado pelo frontend
//     res.json({ dados: results });
//   } catch (error) {
//     console.error('Erro na rota /jogos/:id/jogar/arrastar-soltar:', error);
//     res.status(500).json({ error: 'Erro no servidor' });
//   }
// });

app.get('/jogos/:id/jogar/arrastar-soltar', async (req, res) => {
  const { id } = req.params;

  try {
    const [itensCategorias] = await pool.query('SELECT item, categoria FROM jogo_item_categoria WHERE jogo_id = ?', [id]);
    const [termosDefinicoes] = await pool.query('SELECT termo AS item, definicao AS categoria FROM jogo_termo_definicao WHERE jogo_id = ?', [id]);

    const results = [...itensCategorias, ...termosDefinicoes];

    if (results.length === 0) {
      return res.status(404).json({ error: 'Dados para arrastar e soltar não encontrados' });
    }

    res.json({ dados: results });
  } catch (error) {
    console.error('Erro na rota /jogos/:id/jogar/arrastar-soltar:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// app.get('/jogos/:id/jogar/quiz', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [termosDefinicoes] = await pool.query(
//       'SELECT termo, definicao FROM jogo_termo_definicao WHERE jogo_id = ?', 
//       [id]
//     );

//     if (termosDefinicoes.length === 0) {
//       return res.status(404).json({ error: 'Questões do quiz não encontradas' });
//     }

//     res.json({ dados: termosDefinicoes });
//   } catch (error) {
//     console.error('Erro ao buscar quiz:', error);
//     res.status(500).json({ error: 'Erro no servidor' });
//   }
// });

app.get('/jogos/:id/jogar/quiz', async (req, res) => {
  const { id } = req.params;

  try {
    const [termosDefinicoes] = await pool.query(
      'SELECT termo AS pergunta, definicao AS resposta FROM jogo_termo_definicao WHERE jogo_id = ?', 
      [id]
    );

    const [itensCategorias] = await pool.query(
      'SELECT item AS pergunta, categoria AS resposta FROM jogo_item_categoria WHERE jogo_id = ?', 
      [id]
    );

    if (termosDefinicoes.length > 0) {
      return res.json({ tipo: 'termo-definicao', dados: termosDefinicoes });
    }

    if (itensCategorias.length > 0) {
      return res.json({ tipo: 'item-categoria', dados: itensCategorias });
    }

    res.status(404).json({ error: 'Nenhuma questão encontrada para esse jogo.' });
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ✅ Criar novo jogo
app.post("/usuario/cadastrar", async (req, res) => {
  try {
    const { nome, email, senha} = req.body;

    const SQL = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
    await pool.query(SQL, [
      nome,
      email,
      senha,
    ]);

    res.status(201).json({ message: "Usuário cadastrado com sucesso"});
  } catch (error) {
    console.error("Erro ao cadastrar o usuário:", error);
    res.status(500).json({ error: "Erro ao cadastrar o usuário" });
  }
});

// ✅ Buscar conteúdo de item-categoria por jogo_id
app.get("/login", async (req, res) => {
  try {
    // const {email, senha} = req.params;
    const SQL = `SELECT * FROM usuarios`;
    // const SQL = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;
    const [results] = await pool.query(SQL);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário Não encontrado" });
    }
    res.status(200).json(results);

  } catch (error) {
    console.error("Erro ao consultar usuário:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});




const port = 3002;
app.listen(port, () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
});
