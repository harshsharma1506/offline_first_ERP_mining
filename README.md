# Rethinking “Offline ERP” in Mining: A Case for True Offline-First Systems

## Abstract
In most mining IT literature, “offline ERP” is treated as simply hosting the ERP server on-site, disconnected from the public internet. While this avoids reliance on cloud connectivity, it still requires a functioning local network at all times. In underground mining, where communication links can fail unpredictably, this approach still causes downtime and data loss.

In my work, I’ve been exploring a different angle — a *true offline-first ERP* where data is stored right on the device in the field. Instead of stopping when the network goes down, these devices keep logging operations, safety checks, and production data. When any connection becomes available — whether through Wi-Fi at the surface, a leaky feeder cable, or a mesh link — the data syncs automatically to a central server and ERP. This paper outlines the communication environment in mines, explains why existing ERP models fall short, and proposes a device-level offline-first architecture built using PouchDB and CouchDB.

---

## 1. Introduction
Anyone who’s worked with IT systems in a mining context knows that connectivity is fragile. Rock faces, dust, and equipment constantly get in the way of radio signals. Underground, miners rely on systems like leaky feeders, mesh networks, and RFID checkpoints just to keep basic communication alive.

In ERP research, I’ve noticed that “offline” usually just means “on-premise” — meaning the server is in the mine’s own server room instead of in the cloud. This is better than needing the internet all the time, but there’s a catch: if the local LAN goes down, you can’t use the ERP at all. There’s no buffering of data, no way to capture information while disconnected.

What I’m proposing is different. Imagine if every tablet, scanner, or sensor could keep working without any network — storing its own data — and then, whenever it got even a brief connection, quietly sync with the central ERP. That’s the gap I think we can fill.

---

## 2. A Quick Look at Underground Communication Systems

### 2.1 Leaky Feeder Cables
A leaky feeder is basically a coaxial cable with intentional gaps in its shielding so radio signals can “leak” in and out along its length. It acts like a very long antenna. Amplifiers are placed every few hundred meters to keep the signal strong. They’re reliable for voice and basic data, but not for heavy data like high-res images.

### 2.2 Mesh Networks
In a mesh, each node can talk to its neighbors, passing data along until it reaches the destination. If one node fails, traffic takes another route. This is handy in a mine because layouts change and equipment moves. The downside is that each “hop” adds delay and cuts bandwidth, so big data transfers slow down.

### 2.3 RFID Tracking
RFID tags — passive or active — are used to track people and equipment. Passive tags get their power from the reader’s signal and work only at close range. Active tags have their own battery and can transmit further. This helps track who went where and when, but still depends on readers being placed in the right spots.

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

## 5. Example of Offline-First Sync Logic

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

