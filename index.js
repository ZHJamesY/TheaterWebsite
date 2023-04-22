// Import modules
let express = require('express');
let env = require('dotenv').config();

// Instantiate express application
let app = express();

// Use environment variable specified at command line, or if none provided, 3000 default
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log(`Listening for requests on port ${app.get('port')}.`);
});

// Setup a static server for all files in /public
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

// Serve a static HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api', function(req, res) {
    res.send(process.env.API_KEY);
});

