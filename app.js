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

//  ROTAS GET

// Buscar todos os jogos
app.get("/jogos", async (req, res) => {
  try {
    const SQL = "SELECT * FROM jogos";
    const [results] = await pool.query(SQL);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar jogos de um criador específico
app.get("/meus-jogos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = "SELECT * FROM jogos WHERE criador_id = ?";
    const [results] = await pool.query(SQL, [id]);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogos desse criador:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar jogo pelo título (retorna id)
app.get("/jogo/:titulo", async (req, res) => {
  try {
    const { titulo } = req.params;
    const SQL = "SELECT id FROM jogos WHERE titulo = ?";
    const [results] = await pool.query(SQL, [titulo]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogo por título:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar jogo por id
app.get("/jogar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = "SELECT * FROM jogos WHERE id = ?";
    const [results] = await pool.query(SQL, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar termos-definições por jogo_id
app.get("/termo-definicao/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = "SELECT * FROM jogo_termo_definicao WHERE jogo_id = ?";
    const [results] = await pool.query(SQL, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Termos-Definições não encontrados" });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar termos-definições:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar itens-categorias por jogo_id
app.get("/item-categoria/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const SQL = "SELECT * FROM jogo_item_categoria WHERE jogo_id = ?";
    const [results] = await pool.query(SQL, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Itens-Categorias não encontrados" });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar itens-categorias:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// BUscar dados para o jogo da Associação (item-categoria + termo-definicao)
app.get("/jogos/:id/jogar/associacao", async (req, res) => {
  const { id } = req.params;

  try {
    const [itensCategorias] = await pool.query(
      "SELECT item, categoria FROM jogo_item_categoria WHERE jogo_id = ?",
      [id]
    );
    const [termosDefinicoes] = await pool.query(
      "SELECT termo AS item, definicao AS categoria FROM jogo_termo_definicao WHERE jogo_id = ?",
      [id]
    );

    const results = [...itensCategorias, ...termosDefinicoes];

    if (results.length === 0) {
      return res.status(404).json({ error: "Dados não enocntrados" });
    }

    return res.json({ dados: results });
  } catch (error) {
    console.error("Erro na rota /jogos/:id/jogar/associacao:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar dados para o jogo do Quiz (item-categoria + termo-definicao)
app.get("/jogos/:id/jogar/quiz", async (req, res) => {
  const { id } = req.params;

  try {
    const [termosDefinicoes] = await pool.query(
      "SELECT termo AS pergunta, definicao AS resposta FROM jogo_termo_definicao WHERE jogo_id = ?",
      [id]
    );

    const [itensCategorias] = await pool.query(
      "SELECT item AS pergunta, categoria AS resposta FROM jogo_item_categoria WHERE jogo_id = ?",
      [id]
    );

    if (termosDefinicoes.length > 0) {
      return res.json({ tipo: "termo-definicao", dados: termosDefinicoes });
    }

    if (itensCategorias.length > 0) {
      return res.json({ tipo: "item-categoria", dados: itensCategorias });
    }

    return res.status(404).json({ error: "Nenhuma questão encontrada para esse jogo." });
  } catch (error) {
    console.error("Erro ao buscar quiz:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar usuário por email (retorna id)
app.get("/usuario-id/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const SQL = "SELECT id FROM usuarios WHERE email = ?";
    const [results] = await pool.query(SQL, [email]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado por esse email" });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao consultar usuário por email:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Buscar ranking de um jogo e modo
app.get("/ranking/:jogo_id/:modo", async (req, res) => {
  try {
    const { jogo_id, modo } = req.params;
    const SQL = `
      SELECT u.nome, r.acertos, r.erros, r.tempo
      FROM resultados r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.jogo_id = ? AND r.modo_jogo = ?
    `;

    const [results] = await pool.query(SQL, [jogo_id, modo]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Nenhum resultado encontrado para este jogo." });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// ROTAS POST

//Fazer Login com o usuário
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    const SQL = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    const [results] = await pool.query(SQL, [email, senha]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    // Aqui você pode gerar um token, ou retornar dados do usuário
    return res.status(200).json({ message: "Login realizado com sucesso", usuario: results[0] });
  } catch (error) {
    console.error("Erro ao tentar logar:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});


// Cadastrar novo jogo
app.post("/jogo", async (req, res) => {
  try {
    const { titulo, descricao, criador_id, tipo_jogo } = req.body;

    const SQL = "INSERT INTO jogos (titulo, descricao, criador_id, tipo_jogo) VALUES (?, ?, ?, ?)";
    const [results] = await pool.query(SQL, [titulo, descricao, criador_id, tipo_jogo]);

    return res.status(201).json({ message: "Jogo cadastrado com sucesso", insertId: results.insertId });
  } catch (error) {
    console.error("Erro ao cadastrar o jogo:", error);
    return res.status(500).json({ error: "Erro ao cadastrar o jogo" });
  }
});

// Cadastrar itens-categorias
app.post("/item-categoria", async (req, res) => {
  try {
    const { conteudo, jogo_id } = req.body;

    if (!Array.isArray(conteudo) || conteudo.length === 0) {
      return res.status(400).json({ error: "Conteúdo inválido." });
    }

    const SQL = "INSERT INTO jogo_item_categoria (jogo_id, item, categoria) VALUES (?, ?, ?)";

    for (const { item, categoria } of conteudo) {
      if (!item || !categoria) continue; // Ignorar itens incompletos
      await pool.query(SQL, [jogo_id, item, categoria]);
    }

    return res.status(201).json({ message: "Itens-Categorias cadastrados com sucesso!" });
  } catch (error) {
    console.error("Erro ao inserir itens-categorias:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Cadastrar termos-definições
app.post("/termo-definicao", async (req, res) => {
  try {
    const { conteudo, jogo_id } = req.body;

    if (!Array.isArray(conteudo) || conteudo.length === 0) {
      return res.status(400).json({ error: "Conteúdo inválido." });
    }

    const SQL = "INSERT INTO jogo_termo_definicao (jogo_id, termo, definicao) VALUES (?, ?, ?)";

    for (const { termo, definicao } of conteudo) {
      if (!termo || !definicao) continue; // Ignorar itens incompletos
      await pool.query(SQL, [jogo_id, termo, definicao]);
    }

    return res.status(201).json({ message: "Termos-Definições cadastrados com sucesso!" });
  } catch (error) {
    console.error("Erro ao inserir termos-definições:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Cadastrar novo usuário
app.post("/usuario/cadastrar", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const SQL = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    await pool.query(SQL, [nome, email, senha]);

    return res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (error) {
    console.error("Erro ao cadastrar o usuário:", error);
    return res.status(500).json({ error: "Erro ao cadastrar o usuário" });
  }
});

// Registrar resultado de um jogo
app.post("/resultado", async (req, res) => {
  try {
    const { acertos, erros, tempo, jogo_id, usuario_id, modo_jogo } = req.body;

    const SQL = "INSERT INTO resultados (acertos, erros, tempo, jogo_id, usuario_id, modo_jogo) VALUES (?, ?, ?, ?, ?, ?)";
    await pool.query(SQL, [acertos, erros, tempo, jogo_id, usuario_id, modo_jogo]);

    return res.status(201).json({ message: "Resultado guardado com sucesso" });
  } catch (error) {
    console.error("Erro ao cadastrar resultado:", error);
    return res.status(500).json({ error: "Erro na rota: post/resultado" });
  }
});

//  ROTAS PUT

// Atualizar tipo de jogo
app.put("/jogo/tipo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_jogo } = req.body;

    const SQL = "UPDATE jogos SET tipo_jogo = ? WHERE id = ?";
    const [results] = await pool.query(SQL, [tipo_jogo, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    return res.json({ message: "Tipo do jogo atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar tipo do jogo:", error);
    return res.status(500).json({ error: "Erro ao atualizar o jogo." });
  }
});

// Alterar senha de usuário
app.put("/usuario/alterar-senha", async (req, res) => {
  try {
    const { email, novaSenha } = req.body;

    const SQL = "UPDATE usuarios SET senha = ? WHERE email = ?";
    console.log(`SENHA: ${novaSenha}`);
    console.log(`EMAIL: ${email}`);

    const [results] = await pool.query(SQL, [novaSenha, email]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha do usuário:", error);
    return res.status(500).json({ error: "Erro ao atualizar a senha." });
  }
});


const port = 3002;
app.listen(port, () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
});
