import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log('Database connected');
})
.catch((err) =>{
    console.error('Error connecting to database')
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error' , (error) => {
    console.error('Error starting the server:', error);
});