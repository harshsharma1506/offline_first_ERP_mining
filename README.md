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

## Snapshots 

### Before turning offline 
<img width="1553" height="868" alt="{D10D22D0-BE37-48DE-8DBA-049157C92EC0}" src="https://github.com/user-attachments/assets/ca1416ea-8bc9-4ec7-a304-22184a9cd3af" />

We had 3 orders , same can be seen in the CouchDB backend 
<img width="1858" height="240" alt="{9A240672-EFAB-4BF5-A36D-5801F1C551B0}" src="https://github.com/user-attachments/assets/7c84f9f0-0f8a-4c55-a610-583dbebeb47c" />

### Turning offline 
<img width="1893" height="677" alt="image" src="https://github.com/user-attachments/assets/60bb7022-940b-41e1-848f-a3f121991fd0" />

Now adding the new order 
<img width="1737" height="206" alt="image" src="https://github.com/user-attachments/assets/ed83a1c1-91ca-4ec3-81d5-c53e91ad3e74" />

Still offline, taking a look at the CouchDB - shows yet 
<img width="1915" height="252" alt="image" src="https://github.com/user-attachments/assets/bf09264d-5961-457f-9a58-ffeee7af3dd1" />

### Turning online 
<img width="1783" height="502" alt="image" src="https://github.com/user-attachments/assets/ee4246e5-36d1-4fa8-9dd8-e1bfc62ce1b9" />

Once online in few seconds , we see 4 entries 
<img width="1917" height="265" alt="image" src="https://github.com/user-attachments/assets/25b48b71-e614-47d4-b1fb-cac343a1ec24" />

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
