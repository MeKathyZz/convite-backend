const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid"); // ✅ Importa uuid
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
app.use(express.static("public"));

app.use(cors());
app.use(express.json());

const caminhoArquivo = "respostas.csv";

// ✅ Cria o arquivo com cabeçalho se não existir
if (!fs.existsSync(caminhoArquivo)) {
  fs.writeFileSync(caminhoArquivo, "ID,Data,Nome,Resposta\n");
}

// ✅ Rota para salvar resposta com ID
app.post("/api/resposta", (req, res) => {
  const { nome, resposta, data } = req.body;
  const id = uuidv4();
  const linha = `${id},${data},${nome},${resposta}\n`;

  fs.appendFile(caminhoArquivo, linha, (err) => {
    if (err) {
      console.error("Erro ao salvar resposta:", err);
      return res.status(500).send("Erro ao salvar");
    }
    res.status(200).send("Resposta recebida");
  });
});

// ✅ Rota para visualizar respostas em HTML
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ✅ Rota para retornar respostas como JSON
app.get("/api/respostas", (req, res) => {
  const resultados = [];

  fs.createReadStream(caminhoArquivo)
    .pipe(csv())
    .on("data", (data) => resultados.push(data))
    .on("end", () => {
      res.json(resultados);
    });
});

// ✅ Rota para apagar todas as respostas
app.delete("/api/resposta", (req, res) => {
  fs.writeFile(caminhoArquivo, "ID,Data,Nome,Resposta\n", (err) => {
    if (err) {
      console.error("Erro ao limpar respostas:", err);
      return res.status(500).send("Erro ao limpar");
    }
    res.status(200).json({ mensagem: "Todas as respostas foram apagadas." });
  });
});

// ✅ Rota para apagar uma resposta específica por ID
app.delete("/api/resposta/:id", (req, res) => {
  const idAlvo = req.params.id;
  const respostas = [];

  fs.createReadStream(caminhoArquivo)
    .pipe(csv())
    .on("data", (data) => respostas.push(data))
    .on("end", () => {
      const restantes = respostas.filter(r => r.ID !== idAlvo);
      const linhas = ["ID,Data,Nome,Resposta\n", ...restantes.map(r => `${r.ID},${r.Data},${r.Nome},${r.Resposta}\n`)];

      fs.writeFile(caminhoArquivo, linhas.join(""), (err) => {
        if (err) {
          console.error("Erro ao apagar resposta:", err);
          return res.status(500).send("Erro ao apagar");
        }
        res.status(200).json({ mensagem: "Resposta apagada com sucesso." });
      });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
