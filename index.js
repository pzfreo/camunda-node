const { Client, logger, Variables } = require("camunda-external-task-client-js");
const axios = require("axios");

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 'creditScoreChecker'
client.subscribe("approval", async function({ task, taskService }) {
  console.log("I just got called");
  // get the process variable 'score'
  const orderid = task.variables.get("orderid");
  console.log(orderid)

  const processVariables = new Variables();
  try {

  
    const response = await axios.get(`http://localhost:8000/purchase/${orderid}`);
    if (response.status == 200) {
        processVariables.set("poNumber", response.data.poNumber);
        processVariables.set("quantity", response.data.quantity);
    }
    else {
        processVariables.set("error", "orderid not found");
    }
  } catch (error) {
        processVariables.set("error", "server not available");
  }

  
  await taskService.complete(task);
});