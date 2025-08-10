# Offline-First SAP-like Sales Order System with PouchDB & express-pouchdb

This project demonstrates an **offline-first** sales order management system inspired by SAP-like data entry, using:

- **PouchDB** in the browser for local data storage and offline functionality  
- **express-pouchdb** as a CouchDB-compatible server backend for syncing data centrally  
- Opportunistic data synchronization between local and remote databases when network connectivity is available

This setup is a practical proof-of-concept for opportunistic sync architectures, similar to what was proposed in our Mining Data Sync white paper — showing how data collection apps can work offline and sync seamlessly when online.

---

## Architecture Overview

- Client runs a PouchDB instance to store sales orders locally (offline support).  
- Client syncs the local DB with the remote `express-pouchdb` server when network is available.  
- Server stores the replicated data in a CouchDB-compatible format (LevelDB backend).  
- Users can continue working offline; changes are synced transparently once online.

---

## Features

- Create, store, and view sales orders locally in browser  
- Live bidirectional sync with server DB using PouchDB sync API  
- Network status indicator (online/offline)  
- View server data via Fauxton web interface (`/db/_utils/`)  
- Easy to extend for additional functionality  

---

## Getting Started

### Prerequisites

- Node.js v16+ installed  
- npm (comes with Node.js)  
- Modern web browser  

### Setup and Run Server

1. Clone the repo:  
   ```bash
   git clone <repo-url>
   cd <repo-folder>

2. Install dependencies:

  ```bash
  npm install
  Start the server:
  ```

  ```bash
  npm start
  Open your browser and navigate to: your localhost port
  ```

## Server URLs to Know
```
Frontend app: /

CouchDB-compatible API endpoint: /db

Fauxton UI (DB management): /db/_utils/
```

## How to Use
- Fill the sales order form and submit orders.
- Orders are saved locally immediately.
- Orders sync automatically in the background to the remote server when online.
- Use the Fauxton UI (/db/_utils/) to view server-side stored orders.
- Offline support allows continued usage without internet connection.

## Sync Implementation Details
```
Local DB name: "sap_orders"

Remote DB URL: http://<host>:<port>/db/sap_orders

PouchDB sync options: { live: true, retry: true }
```

## Example sync code snippet from app.js:

```js
const localDB = new PouchDB("sap_orders");
const remoteDB = new PouchDB("http://localhost:3000/db/sap_orders");

localDB.sync(remoteDB, {
  live: true,
  retry: true,
})
  .on("change", info => console.log("Sync change:", info))
  .on("error", err => console.error("Sync error:", err));
```

## Troubleshooting
- Fauxton UI is empty?
  - Ensure some data has synced by adding orders on the client and confirming network connection.

- Sync errors?
  - Check CORS policy and server URL correctness.

- Server port in use?
  - Make sure no other process occupies the configured port.

## Next Steps and Extensions

- Add conflict resolution UI
- Implement authentication for users
- Extend order data with more SAP-like fields
- Add reporting and analytics dashboards
- Deploy backend on cloud with persistent storage

Credits
Developed as a demo to validate the opportunistic sync architecture from the Mining Data Sync white paper.
