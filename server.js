import express from 'express';
import * as url from 'url';

const app = express();
const PORT = 3000;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/views/index.html`)
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});