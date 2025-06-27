const nodeapp = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'processFlow.html'));
});

app.post('/api', (req, res) => {
    const data = req.body;
    console.log(data);
    res.json({ message: 'Data received', data: data });
});
