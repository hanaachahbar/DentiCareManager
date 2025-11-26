const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("../config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const patientsRoute = require("./routes/patients");
const appointmentsRoute = require("./routes/appointments");
const documentsRoute = require("./routes/documents");
const servicesRoute = require("./routes/services");
const prescriptionsRoute = require("./routes/prescriptions");
const medicationsRoute = require("./routes/medications");
const paymentsRoute = require("./routes/payments");
const invoicesRoute = require("./routes/invoices");
const labsRoute = require("./routes/labs");
const labWorksRoute = require("./routes/lab_works");

// Route mappings
app.use("/api/patients", patientsRoute);
app.use("/api/appointments", appointmentsRoute);
app.use("/api/documents", documentsRoute);
app.use("/api/services", servicesRoute);
app.use("/api/prescriptions", prescriptionsRoute);
app.use("/api/medications", medicationsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/invoices", invoicesRoute);
app.use("/api/labs", labsRoute);
app.use("/api/lab_works", labWorksRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("SQL Backend API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));