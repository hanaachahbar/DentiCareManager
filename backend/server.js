const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const patientsRoute = require("./routes/patients");
const paymentsRoute = require("./routes/payments");
const invoicesRoute = require("./routes/invoices");
const servicesRoute = require("./routes/services");
const appointmentsRoute = require("./routes/appointments");

/*
const documentsRoute = require("./routes/documents");
const prescriptionsRoute = require("./routes/prescriptions");
const medicationsRoute = require("./routes/medications");
*/

// Route mappings
app.use("/api/patients", patientsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/invoices", invoicesRoute);
app.use("/api/services", servicesRoute);
app.use("/api/appointments", appointmentsRoute);

/*
app.use("/api/documents", documentsRoute);
app.use("/api/prescriptions", prescriptionsRoute);
app.use("/api/medications", medicationsRoute);
*/

const labsRoute = require("./routes/labs");
const labWorksRoute = require("./routes/labWorks");
const labServicesRoute = require("./routes/labService");

// Route mappings
/*
app.use("/api/documents", documentsRoute);
app.use("/api/prescriptions", prescriptionsRoute);
app.use("/api/medications", medicationsRoute);
*/

app.use("/api/labs", labsRoute);
app.use("/api/lab_works", labWorksRoute);
app.use("/api/labService", labServicesRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("SQL Backend API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));