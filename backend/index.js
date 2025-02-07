const axios = require('axios');
require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');

const app = express();
require('./Models/db');
const PORT = process.env.PORT || 8080;

app.get('/cluster-users', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/cluster-users');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clustered data", error: error.message });
  }
});

app.use(bodyParser.json());
app.use(cors()); 
app.use('/auth', AuthRouter)
app.use('/products', ProductRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

})