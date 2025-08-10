// Initialize PouchDB
const db = new PouchDB("sap_orders");

// Remote PouchDB server URL for syncing
const remoteDB = new PouchDB(
  <server_url>",
);

// Setup live sync between local and remote DB
db.sync(remoteDB, {
  live: true,
  retry: true,
})
  .on("change", (info) => {
    console.log("Sync change:", info);
    renderOrders(); // update UI on changes from sync
  })
  .on("error", (err) => {
    console.error("Sync error:", err);
  });
// Elements
const orderForm = document.getElementById("orderForm");
const ordersTable = document.getElementById("ordersTable");

// Render all orders from DB to table
async function renderOrders() {
  ordersTable.innerHTML = ""; // clear existing
  try {
    const result = await db.allDocs({ include_docs: true, descending: true });
    result.rows.forEach((row) => {
      const order = row.doc;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.orderId}</td>
        <td>${order.orderDate}</td>
        <td>${order.customer}</td>
        <td>${order.customerId}</td>
        <td>${order.materialCode}</td>
        <td>${order.materialDesc}</td>
        <td>${order.quantity}</td>
        <td>${order.unitPrice.toFixed(2)}</td>
        <td>${order.currency}</td>
        <td>${order.salesOrg}</td>
        <td>${order.distChannel}</td>
        <td>${order.division}</td>
        <td>${order.status}</td>
      `;
      ordersTable.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching orders", err);
  }
}

// Add new order to DB
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get values from form
  const order = {
    _id: new Date().toISOString(), // use timestamp as unique doc id
    orderId: orderForm.orderId.value.trim(),
    orderDate: orderForm.orderDate.value,
    customer: orderForm.customer.value.trim(),
    customerId: orderForm.customerId.value.trim(),
    materialCode: orderForm.materialCode.value.trim(),
    materialDesc: orderForm.materialDesc.value.trim(),
    quantity: parseInt(orderForm.quantity.value, 10),
    unitPrice: parseFloat(orderForm.unitPrice.value),
    currency: orderForm.currency.value,
    salesOrg: orderForm.salesOrg.value.trim(),
    distChannel: orderForm.distChannel.value.trim(),
    division: orderForm.division.value.trim(),
    status: orderForm.status.value,
  };

  try {
    await db.put(order);
    orderForm.reset();
    renderOrders();
  } catch (err) {
    console.error("Error saving order", err);
  }
});

// Initial render on page load
renderOrders();
const networkStatusEl = document.getElementById("networkStatus");

function updateNetworkStatus() {
  if (navigator.onLine) {
    networkStatusEl.textContent = "🟢 Online";
    networkStatusEl.style.color = "green";
  } else {
    networkStatusEl.textContent = "🔴 Offline";
    networkStatusEl.style.color = "red";
  }
}

// Initial check
updateNetworkStatus();

// Listen for online/offline events
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

document.getElementById("showOrdersBtn").addEventListener("click", async () => {
  const result = await db.allDocs({ include_docs: true });
  console.log(
    "All Orders:",
    result.rows.map((r) => r.doc),
  );
  alert(`Check the browser console for ${result.rows.length} orders.`);
});
