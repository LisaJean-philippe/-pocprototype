const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3001;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/process', (req, res) => {
    res.sendFile(path.join(__dirname, '../processFlow.html/processFlow.html'));
});

app.get('/test', (req, res) => {
    res.send('Test route works!');
});

app.post('/api', (req, res) => {
    const data = req.body;
    console.log(data);
    res.json({ data: data });
});

app.listen(port, () => {
    console.log(`\x1b]8;;http://localhost:${port}\x1b\\Server is running on http://localhost:${port}\x1b]8;;\x1b\\`);
});

module.exports = app;
