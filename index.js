const { Client, logger, Variables } = require("camunda-external-task-client-js");
const axios = require("axios");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

client.subscribe("getPurchase", async function({ task, taskService }) {
  const orderid = task.variables.get("orderid");
  const processVariables = new Variables();
  const localVariables = new Variables();
  try {
    // call the purchase service using orderid
    const response = await axios.get(`http://localhost:8000/purchase/${orderid}`);
    if (response.status == 200) {
        console.log("found");
        console.log(response.data);
        processVariables.set("poNumber", response.data.poNumber);
        processVariables.set("quantity", response.data.quantity);
        processVariables.set("customerNumber", response.data.customerNumber);
        processVariables.set("lineItem", response.data.lineItem);
        processVariables.set("paymentReference", response.data.paymentReference);
        processVariables.set("date", response.data.date);
        processVariables.set("error", "none");
    }
    else {
        processVariables.set("error", "orderid not found");
    }
  } catch (error) {
        processVariables.set("error", "server not available");
  }

  await taskService.complete(task, processVariables, localVariables);
});