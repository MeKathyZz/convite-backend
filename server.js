const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser"); // ✅ Agora está no topo
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const caminhoArquivo = "respostas.csv";

// Cria o arquivo com cabeçalho se não existir
if (!fs.existsSync(caminhoArquivo)) {
  fs.writeFileSync(caminhoArquivo, "Data,Nome,Resposta\n");
}

// ✅ Rota para salvar resposta
app.post("/api/resposta", (req, res) => {
  const { nome, resposta, data } = req.body;
  const linha = `${data},${nome},${resposta}\n`;

  fs.appendFile(caminhoArquivo, linha, (err) => {
    if (err) {
      console.error("Erro ao salvar resposta:", err);
      return res.status(500).send("Erro ao salvar");
    }
    res.status(200).send("Resposta recebida");
  });
});

// ✅ Rota para visualizar respostas
app.get("/admin", (req, res) => {
  const resultados = [];

  fs.createReadStream(caminhoArquivo)
    .pipe(csv())
    .on("data", (data) => resultados.push(data))
    .on("end", () => {
      let html = `
        <html>
          <head>
            <title>Respostas do Convite</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>Respostas Recebidas</h2>
            <table>
              <tr><th>Data</th><th>Nome</th><th>Resposta</th></tr>
              ${resultados.map(r => `<tr><td>${r.Data}</td><td>${r.Nome}</td><td>${r.Resposta}</td></tr>`).join("")}
            </table>
          </body>
        </html>
      `;
      res.send(html);
    });
});

app.get("/api/respostas", (req, res) => {
  const resultados = [];

  fs.createReadStream(caminhoArquivo)
    .pipe(csv())
    .on("data", (data) => resultados.push(data))
    .on("end", () => {
      res.json(resultados);
    });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
