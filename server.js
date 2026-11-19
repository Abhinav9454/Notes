const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Redirect legacy routes to html_css.html
app.get(['/html', '/html.html', '/css', '/css.html', '/html-css', '/html-css.html'], (req, res) => {
  res.redirect('/html_css.html');
});

// Static asset folders
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Main Route Handlers
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/java', (req, res) => {
  res.sendFile(path.join(__dirname, 'java.html'));
});

app.get(['/springboot', '/springboot.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'springboot.html'));
});

app.get('/dsa', (req, res) => {
  res.sendFile(path.join(__dirname, 'dsa.html'));
});

app.get('/c', (req, res) => {
  res.sendFile(path.join(__dirname, 'c.html'));
});

app.get('/cpp', (req, res) => {
  res.sendFile(path.join(__dirname, 'cpp.html'));
});

app.get(['/sql', '/sql.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'sql.html'));
});

app.get(['/dbms', '/dbms.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'dbms.html'));
});

app.get('/cn', (req, res) => {
  res.sendFile(path.join(__dirname, 'cn.html'));
});

app.get(['/html', '/html.html', '/html-css', '/html-css.html', '/html_css', '/html_css.html', '/css', '/css.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'html_css.html'));
});

app.get(['/js', '/js.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'js.html'));
});


// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Smart Notes Hub is live on localhost!`);
  console.log(`👉 Hub (Main): http://localhost:${PORT}`);
  console.log(`👉 Spring Boot: http://localhost:${PORT}/springboot.html`);
  console.log(`👉 Java Notes: http://localhost:${PORT}/java.html`);
  console.log(`👉 DSA Notes:  http://localhost:${PORT}/dsa.html`);
  console.log(`👉 C Notes:    http://localhost:${PORT}/c.html`);
  console.log(`👉 C++ Notes:  http://localhost:${PORT}/cpp.html`);
  console.log(`👉 SQL Notes:  http://localhost:${PORT}/sql.html`);
  console.log(`👉 DBMS Notes: http://localhost:${PORT}/dbms.html`);
  console.log(`👉 CN Notes:   http://localhost:${PORT}/cn.html`);
  console.log(`👉 HTML & CSS: http://localhost:${PORT}/html_css.html`);
  console.log(`👉 JS Notes:   http://localhost:${PORT}/js.html`);

  console.log(`☀️  UI Mode:    DAY MODE ONLY`);
  console.log(`📱 Responsive: Mobile, Tablet & Desktop`);
  console.log(`======================================================\n`);
});
