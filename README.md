# Rethinking “Offline ERP” in Mining: A Case for True Offline-First Systems

## Author
Harsh Sharma
Independent Researcher, Mining IT Systems & ERP Integration

GitHub: github.com/harshsharma1506

LinkedIn: linkedin.com/in/harsh-sharma-521a30217

Research Focus: Offline-first architectures, ERP-OT integration, mining communication systems, and industrial IoT resilience.
Contribution: Concept design, architecture development, integration strategy for mining ERP, and manuscript preparation.

## Abstract
In most mining IT literature, “offline ERP” is treated as simply hosting the ERP server on-site, disconnected from the public internet. While this avoids reliance on cloud connectivity, it still requires a functioning local network at all times. In underground mining, where communication links can fail unpredictably, this approach still causes downtime and data loss.

In my work, I’ve been exploring a different angle — a *true offline-first ERP* where data is stored right on the device in the field. Instead of stopping when the network goes down, these devices keep logging operations, safety checks, and production data. When any connection becomes available — whether through Wi-Fi at the surface, a leaky feeder cable, or a mesh link — the data syncs automatically to a central server and ERP. This paper outlines the communication environment in mines, explains why existing ERP models fall short, and proposes a device-level offline-first architecture built using PouchDB and CouchDB.

---

## 1. Introduction
Anyone who’s worked with IT systems in a mining context knows that connectivity is fragile [1]. Rock faces, dust, and equipment constantly get in the way of radio signals. Underground, miners rely on systems like leaky feeders [4], mesh networks [1], and RFID checkpoints [1] just to keep basic communication alive.

In ERP research, “offline” usually just means “on-premise” — meaning the server is in the mine’s own server room instead of in the cloud [2]. This is better than needing the internet all the time, but there’s a catch: if the local LAN goes down, you can’t use the ERP at all. There’s no buffering of data, no way to capture information while disconnected.

What I’m proposing is different. Imagine if every tablet, scanner, or sensor could keep working without any network — storing its own data — and then, whenever it got even a brief connection, quietly sync with the central ERP. That’s the gap I think we can fill.

---

## 2. A Quick Look at Underground Communication Systems

### 2.1 Leaky Feeder Cables
A leaky feeder is basically a coaxial cable with intentional gaps in its shielding so radio signals can “leak” in and out along its length. It acts like a very long antenna. Amplifiers are placed every few hundred meters to keep the signal strong. They’re reliable for voice and basic data, but not for heavy data like high-res images.

<img width="457" height="480" alt="image" src="https://github.com/user-attachments/assets/2b3875b7-0825-4285-8c53-c6f59fcd53b2" />

 The image shows a Basic Leaky Feeder Layout for underground mine communications. This is a commonly used system that enables radio communications in environments where normal radio signals cannot travel due to rock, depth, or interference.
Let’s break down the components and terms used in the diagram (based on Novak, 2010):

🔹 BS – Base Station
Located at the surface, it’s the main communication hub that connects the underground network to the external world.

Typically includes radios, servers, and routing equipment to handle data and voice.

🔹 PS – Power Supply
Provides electrical power to different parts of the leaky feeder system.
May include battery backup in case of power failure.
You’ll notice multiple PS units underground — these ensure the system keeps working throughout the network.

🔹 Power Injection Point
Where power is injected into the coaxial cable line to run the in-line amplifiers and other electronic components.
Typically co-located with the Base Station.

🔹 Shaft, Slope, or Borehole
This is the vertical or inclined tunnel that connects the surface with the underground mine.

The leaky feeder cable runs through this structure to extend communication underground.

🔹 Barrier
An intrinsically safe barrier or protection device that ensures electrical equipment used underground does not cause sparks or explosions (important for explosive atmospheres like coal mines).

Separates safe (surface) and hazardous (mine) areas electrically.

🔹 A – In-Line Amplifier
These boost the signal strength along the leaky feeder cable to compensate for losses over distance.

Ensures clear and continuous communication over long stretches.

They are placed periodically (in both horizontal and vertical directions) in the system.

🔹 Leaky Feeder Cable
A coaxial cable that is specially designed to "leak" radio signals out and let them back in.
Acts like a long antenna – enabling radios to communicate with each other underground.
Provides radio coverage in tunnels, even where regular radios would fail.

🔹 Cell
A zone or segment in the mine that is covered by a certain portion of the leaky feeder system.
Defined by signal coverage, amplifier spacing, and network topology.
Each cell is essentially a communication coverage area.

🔹 Inline T-Junctions
The branching points (black squares) where feeder cables split off to cover different areas.
Allow the system to be modular and expand into other shafts or rooms.

### 2.2 Mesh Networks
In a mesh, each node can talk to its neighbors, passing data along until it reaches the destination. If one node fails, traffic takes another route. This is handy in a mine because layouts change and equipment moves. The downside is that each “hop” adds delay and cuts bandwidth, so big data transfers slow down.

<img width="537" height="372" alt="image" src="https://github.com/user-attachments/assets/0cba4e4e-7ae2-45a1-97a2-63b547d71b9a" />

### 2.3 RFID Tracking
RFID tags — passive or active — are used to track people and equipment. Passive tags get their power from the reader’s signal and work only at close range. Active tags have their own battery and can transmit further. This helps track who went where and when, but still depends on readers being placed in the right spots.

A Reader-Tag system typically includes:

- Tags: Small electronic devices worn by miners or attached to equipment. Each tag has a unique ID.
- Readers: Devices installed at intervals along the leaky feeder cable or at strategic points (e.g., entries, intersections) that detect nearby tags and send data to the control center via the leaky feeder system.
- Tracking Software: Software on the surface receives signals from the readers and determines the real-time location of personnel/equipment.

🛠️ How It Works (Step-by-Step)
- Miner wears a tag (often on their helmet or belt).
- As they move underground, they pass by a reader installed near the leaky feeder cable.
- The reader detects the tag’s signal and logs:
  - Tag ID
  - Time
  - Reader location

This data is sent to the surface control center via the leaky feeder network.
The control software updates the miner’s current location on the map.

<img width="551" height="352" alt="image" src="https://github.com/user-attachments/assets/b956c375-4782-4139-bbbc-6dd253a6cbcf" />


---

## 3. Why Current ERP Models Struggle

| Feature                | Cloud ERP | On-Prem ERP (called “offline” in research) | True Offline-First ERP |
|------------------------|-----------|--------------------------------------------|------------------------|
| Needs internet         | Yes       | No, but needs local network                | No                     |
| Works during LAN loss  | No        | No                                         | Yes                    |
| Sync after downtime    | No        | No                                         | Yes                    |
| Data storage           | Cloud     | Central server                             | On device              |

From my reading and my own reasoning, the biggest flaw is that **on-prem ERP is still network-bound**. Once the LAN link to the server is broken, all the field devices are useless until it comes back.

---

## 4. The Architecture I’m Proposing

- **Local Database on Device** — Every field device (tablet, handheld RFID reader, etc.) runs a PouchDB instance.  
- **Central CouchDB** — Lives on-site or in the cloud; acts as the sync target.  
- **Sync Layer** — As soon as any connection is detected (Wi-Fi, fibre, mesh, leaky feeder), the device sends its local changes and pulls down updates.

This means data collection never stops. If a miner does an equipment check deep underground, it’s stored locally. Hours later, when they pass through a zone with coverage, it syncs — no manual steps needed.

---

## 4.1. Example of Offline-First Sync Logic

```pseudo
Start device application
Connect to local PouchDB

LOOP while device in use:
    Collect new data from user or sensors
    Save to PouchDB
    IF network_available():
        Sync PouchDB with CouchDB
    ELSE:
        Keep collecting offline
END LOOP
```

This is simple, but in a mine, simplicity is a strength — fewer moving parts means fewer things to break.


---

## 5. Data Silo Issues 

Mining operations rarely have a single, unified data platform [3]. 
Instead, they rely on a patchwork of systems: ERP for finance, SCADA for telemetry, safety reporting tools, geological modeling software, and ad-hoc spreadsheets.

This creates "data silos" — isolated pockets of information that cannot easily be combined [3]. This leads to:
- **Duplicate data entry**
- **Inconsistent records**
- **Delayed decisions**
- **Higher maintenance costs**

---

## 6. Integrating Offline-First Architecture with Existing Data Silos

### Overview
To be useful in live mines, an offline-first layer (PouchDB on devices + CouchDB sync server) must sit *on top of*, not *instead of*, the existing data silos. The pragmatic goal is to *bridge* silos with minimum disruption: capture data reliably at the edge during outages, then transform and route it into established systems when sync is possible.

****

<img width="1152" height="155" alt="image" src="https://github.com/user-attachments/assets/829eddc7-45b2-43fd-bcc0-1e146dfb17d5" />

### High-level architecture
- **Field devices (PouchDB)**: Capture operational data offline.
- **Connectivity layer**: Any available link is used for sync.
- **CouchDB (surface)**: Acts as sync hub.
- **Middleware**: Transforms and routes to ERP, SCADA, Safety DB, Geology DB.
- **Existing silos**: Receive updates without changes to their architecture.

### Practical flow (equipment inspection)
1. Inspector records check in PouchDB.
2. Stays local if offline.
3. Syncs when online to CouchDB.
4. Middleware maps and pushes to ERP, maintenance DB, and safety logs.

### Middleware responsibilities
- Subscribe to CouchDB changes.
- Validate and enrich data.
- Map to target schema.
- Deliver via APIs/connectors.
- Handle conflicts and security.

### Conflict resolution
Define sources of truth per domain. Use field-level merges or manual review queues where necessary.

### Data model
Each record should include UUID, type, device_id, user_id, timestamp, source, and sync status.

### Connectors
ERP via API/DB connectors, SCADA via MQTT/OPC-UA, safety logs via SQL/JSON API, assets via object storage.

### Security
TLS, signed payloads, token-based authentication, full audit logs.

### Deployment plan
- Stage 0: Lab simulation.
- Stage 1: Pilot in single section.
- Stage 2: Gradual rollout.

### Limitations
- Latency not suitable for real-time control loops.
- Middleware mapping maintenance overhead.
- Edge storage constraints.

---

## 7. Benefits in the Mining Context
- Safety data never lost.
- No downtime during outages.
- Better reporting without double entry.
- Works in remote exploration sites.

---

## 8. Database Comparison: Traditional ERP vs. Offline-First

| Feature                         | Traditional ERP DB       | Offline-First (PouchDB + CouchDB) |
|---------------------------------|--------------------------|------------------------------------|
| Storage Location                | Central server           | On-device + sync to server         |
| Network Requirement             | Always-on LAN/internet   | Only for sync events               |
| Conflict Handling               | Locked records           | Multi-version merge resolution     |
| Sync Method                     | Direct DB transactions   | Batch replication                  |
| Resilience During Outages       | Stops working            | Fully functional                   |
| Schema Flexibility              | Rigid, pre-defined       | JSON-based, flexible               |
| Ease of Edge Deployment         | Complex setup            | Simple app install                 |
| Suitable for Real-Time Control  | Yes                      | Limited by sync delay               |

---

## 9. Operational Feature Comparison: Before vs. After Offline-First

| Feature/Process        | Current Operations (On-Prem)                  | With Offline-First ERP                       |
|------------------------|-----------------------------------------------|-----------------------------------------------|
| Data Capture           | Stops when LAN down                           | Continues regardless of connectivity         |
| Safety Reporting       | Delayed if network unavailable                | Logs instantly, syncs later                   |
| Equipment Tracking     | Limited to connected zones                    | Logs anywhere, updates when connected         |
| Decision-Making        | Based on last synced server data              | Includes latest field data after sync         |
| Integration Effort     | Manual entries in multiple systems            | Single entry, middleware distributes          |
| Downtime Costs         | High during outages                           | Reduced significantly                         |
| Field Productivity     | Workers idle during network issues            | Continuous work without interruption          |

---

## 10. Conclusion
The industry’s definition of “offline ERP” has been too narrow — often meaning only “on-premise” [2]. In practice, on-prem ERP still halts without a live network. A true offline-first ERP — with device-level data capture, PouchDB/CouchDB sync, and middleware integration — ensures mining operations keep moving even when connectivity fails.  

By addressing data silos [3], using proven underground communication systems [1][4], and leveraging offline-first tech, mines can dramatically reduce downtime, improve safety logging, and unify reporting without overhauling existing systems.

---

## 11. Future Work

While the offline-first ERP concept addresses immediate operational challenges, further research and prototyping can strengthen its applicability in mining:

### 11.1 Communication System Simulations
Develop simulation algorithms to model:
- **Leaky Feeder Performance**: Signal decay over distance, amplifier placement optimization, and effect of branching on coverage.
- **Mesh Network Routing**: Node failure scenarios, latency per hop, and optimal routing algorithms for variable mine topologies.
- **RFID Tag Detection**: Probability of read success based on tag orientation, movement speed, and interference levels.

### 11.2 Data Synchronization Strategies
Experiment with:
- **Incremental vs. Full Sync**: Testing how partial replication can reduce bandwidth usage underground.
- **Conflict Resolution Policies**: Applying domain-specific merge rules for safety vs. production data.
- **Compression Before Sync**: To optimize data transfer over low-bandwidth connections.

### 11.3 Middleware Optimization
- Dynamic schema mapping between PouchDB JSON and silo-specific database schemas.
- Automated API endpoint detection for legacy systems.
- Event-driven data routing to reduce sync-to-reporting latency.

### 11.4 Hybrid Communication Models
Integrating leaky feeder, mesh, and short-burst high-speed fibre access points to create “connectivity bubbles” in strategic mine zones, enabling periodic high-volume syncs without full coverage.

These future efforts will ensure that the offline-first ERP is not only resilient but also optimized for the unique constraints of underground mining operations.

## References

1. Ghosh, A., Mishra, S., & Varma, A. *Status of Communication and Tracking Technologies in Underground Mines*.
2. Rahman, A., et al. *Agile Data Architecture in Mining Industry for Continuous Business-IT Alignment: EA Perspective*.
3. Ntwist Technologies. (2023). *Mine-to-Mill: Breaking Down Siloed Data in Mining Operations*. Retrieved from https://ntwist.com/blog/mine-to-mill-siloed-data
4. Nowak, M. (2010). *Basic Leaky Feeder Layout for Underground Mine Communications*. [Technical Document].
