import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js'

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Routes
app.use("/api/users", userRoutes);  
app.use("/api/auth", authRoutes); 
app.use("/api/posts", postRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "Backend OK" });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connecté à MongoDB Atlas"))
  .catch(err => console.error("Erreur MongoDB :", err));

// Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`);
});