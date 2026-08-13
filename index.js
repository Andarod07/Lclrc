require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
app.use(express.json());

const authRoutes = require("./routes/authRoutes")
app.use('/auth', authRoutes)

const MongoUrl = process.env.MONGODB_URI;


// Basic route
app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// No export here to avoid circular require issues — DB module reads env directly.