const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const winston = require('winston');
const app = express();

const logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });

// Helper function to parse cookies
function parseCookies(cookieString) {
    if (!cookieString) return {};
    
    return cookieString
        .split(';')
        .map(cookie => cookie.trim())
        .reduce((cookies, cookie) => {
            const [key, value] = cookie.split('=');
            cookies[key] = value;
            return cookies;
        }, {});
}

// Create a self-signed certificate for localhost
const options = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

// Load the .env file
require('dotenv').config();

app.use(express.static('public', {
    setHeaders: function (res, path, stat) {
        // Set the origin trial token
        res.set('Origin-Trial', process.env.TOKEN);
        res.set('X-Allow-FLEDGE', 'true');
        res.set('Sec-Fetch-Dest', 'fencedframe');
        res.set('Supports-Loading-Mode', 'fenced-frame');
    }
}));

app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname + '/static/html/index.html'));
});

app.get('/advertiser2', (_, res) => {
    res.sendFile(path.join(__dirname + '/static/html/advertiser2.html'));
});

app.get('/leave', (_, res) => {
    res.sendFile(path.join(__dirname + '/static/html/leave_ig.html'));
});

app.get('/publisher', (_, res) => {
    res.sendFile(path.join(__dirname + '/static/html/publisher.html'));
});

app.get('/travel-cookie', (req, res) => {
    const userIP = req.socket.remoteAddress || 
                    req.headers['x-forwarded-for'] || 
                    '0.0.0.0';
    res.setHeader('Set-Cookie', [
        `userIP=${userIP}; path=/`,
        `adVisited=travel; path=/`
    ]);
    res.sendFile(path.join(__dirname + '/static/html/cafe_cookie.html'));
})

app.get('/cafe-cookie', (req, res) => {
    const userIP = req.socket.remoteAddress || 
                    req.headers['x-forwarded-for'] || 
                    '0.0.0.0';
    res.setHeader('Set-Cookie', [
        `userIP=${userIP}; path=/`,
        `adVisited=cafe; path=/`
    ]);
    res.sendFile(path.join(__dirname + '/static/html/travel_cookie.html'));
})

app.get('/news-cookie', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    logger.log({
        level: 'info',
        message: 'Cookie details: ' + req.headers.cookie
    });
    if (cookies.adVisited == 'cafe') {
        res.sendFile(path.join(__dirname + '/static/html/cookie_ad_cafe.html'));
    } else {
        res.sendFile(path.join(__dirname + '/static/html/cookie_ad_travel.html'));
    }
})


app.use('/static', express.static('static', {
    setHeaders: function (res, path, stat) {
        // Set the origin trial token
        res.set('Origin-Trial', process.env.TOKEN);
        res.set('X-Allow-FLEDGE', 'true');
        res.set('Sec-Fetch-Dest', 'fencedframe');
        res.set('Supports-Loading-Mode', 'fenced-frame');
    }
}));

https.createServer(options, app).listen(8080);