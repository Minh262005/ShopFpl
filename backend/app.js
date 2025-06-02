const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbInit } = require('./db');


const app = express();

app.use(cors()); 
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); 

dbInit().then(() => {
    app.listen(3001, () => {
        console.log('🔥 Server chạy tại http://localhost:3001');
    });
}).catch((err) => {
    console.error('❌ Không thể khởi tạo DB:', err);
});
