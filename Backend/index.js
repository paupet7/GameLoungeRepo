require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sql, getConnection } = require('./db');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swaggger-output.json');

const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const themeRoutes = require("./routes/themeRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use('/api/games/:gameId/themes', themeRoutes);
app.use('/api/games/:gameId/themes/:themeId/comments', commentRoutes);


///////// DOUBLE(refresh) TOKEN, LOGOUT add

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
// server

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await getConnection();
    console.log(`🚀 GameLounge API running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});