import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import PouchDB from "pouchdb";
import pouchdbAdapterLeveldb from "pouchdb-adapter-leveldb";
import expressPouchDB from "express-pouchdb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

PouchDB.plugin(pouchdbAdapterLeveldb);

const app = express();

// Optional: create local DB instance (for server use)
const localDB = new PouchDB("orders");

// Mount PouchDB HTTP API at /db
app.use("/db", expressPouchDB(PouchDB));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`App running at http://${HOST}:${PORT}`);
  console.log(`PouchDB HTTP API available at http://${HOST}:${PORT}/db`);
});
