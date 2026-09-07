require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//setup plc listener requirement
const plc_listener = require("./PlC_routes/plc_listener")

//setup routes 
const authRoutes = require("./routes/authRoutes")
app.use('/auth', authRoutes)
const editPLCs = require("./PlC_routes/editPLCs")
app.use("/plc", editPLCs)

//react
const cors = require('cors');
app.use(cors());


const authenticateToken = require('./routes/authMiddleware');
const privRoutes = require('./routes/priv_routes')
//Private routes
app.use("/priv",authenticateToken,privRoutes)

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// No export here to avoid circular require issues — DB module reads env directly.