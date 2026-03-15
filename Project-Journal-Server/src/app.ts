import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import coreRoutes from "./routes/core.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/core", coreRoutes);
app.use("/api/users", userRoutes);
app.use("/api/journals", journalRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(errorMiddleware);
export default app;