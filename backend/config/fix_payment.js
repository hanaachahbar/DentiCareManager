// fix-payment-table.js
// This will fix the Payment table structure

const db = require("./db");

console.log(" Starting Payment table fix...\n");

db.serialize(() => {
  // Step 1: Check current structure
  db.all("PRAGMA table_info(Payment)", (err, columns) => {
    if (err) {
      console.error("❌ Error checking table:", err.message);
      db.close();
      return;
    }

    console.log("Current Payment table columns:");
    columns.forEach(col => console.log(`  - ${col.name}`));
    console.log("");

    // Step 2: Backup existing data (if any)
    db.all("SELECT * FROM Payment", (err, data) => {
      if (err) {
        console.log("⚠️  No existing data to backup (table might not exist)");
      } else {
        console.log(`📦 Found ${data.length} existing payment records`);
      }

      // Step 3: Drop the table with all dependencies
      console.log("\n🗑️  Dropping Payment table...");
      
      db.run("PRAGMA foreign_keys = OFF", (err) => {
        if (err) console.error("Error disabling foreign keys:", err.message);

        // Drop dependent tables first
        db.run("DROP TABLE IF EXISTS Invoices", (err) => {
          if (err) console.error("Error dropping Invoices:", err.message);
          else console.log("  ✓ Dropped Invoices table");

          db.run("DROP TABLE IF EXISTS Payment", (err) => {
            if (err) {
              console.error("❌ Error dropping Payment:", err.message);
              db.close();
              return;
            }
            console.log("  ✓ Dropped Payment table");

            // Step 4: Recreate tables with correct schema
            console.log("\n🔨 Recreating tables...");

            const createPaymentTable = `
              CREATE TABLE Payment (
                payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_id INTEGER UNIQUE,
                total_amount REAL NOT NULL,
                paid_amount REAL DEFAULT 0,
                status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'partially_paid', 'completed')),
                description TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
              )
            `;

            db.run(createPaymentTable, (err) => {
              if (err) {
                console.error("❌ Error creating Payment table:", err.message);
                db.close();
                return;
              }
              console.log("  ✓ Created Payment table");

              const createInvoicesTable = `
                CREATE TABLE Invoices (
                  invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  payment_id INTEGER,
                  appointment_id INTEGER UNIQUE,
                  amount REAL NOT NULL,
                  description TEXT,
                  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (payment_id) REFERENCES Payment(payment_id) ON DELETE CASCADE,
                  FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
                )
              `;

              db.run(createInvoicesTable, (err) => {
                if (err) {
                  console.error("❌ Error creating Invoices table:", err.message);
                } else {
                  console.log("  ✓ Created Invoices table");
                }

                // Re-enable foreign keys
                db.run("PRAGMA foreign_keys = ON", (err) => {
                  if (err) console.error("Error enabling foreign keys:", err.message);
                  else console.log("\n✓ Foreign keys re-enabled");

                  // Verify the fix
                  db.all("PRAGMA table_info(Payment)", (err, newColumns) => {
                    if (err) {
                      console.error("❌ Error verifying:", err.message);
                    } else {
                      console.log("\n✅ Payment table now has these columns:");
                      newColumns.forEach(col => {
                        console.log(`  - ${col.name} (${col.type})`);
                      });
                      console.log("\n🎉 Fix completed! You can now create services.");
                    }
                    db.close();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
exports.createInvoice = (req, res) => {
  const { payment_id, appointment_id, amount, description } = req.body;

  if (!payment_id || !appointment_id || !amount) {
    return res.status(400).json({ error: "payment_id, appointment_id, and amount are required" });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "amount must be greater than 0" });
  }

  // Check if payment exists
  db.get("SELECT * FROM Payment WHERE payment_id = ?", [payment_id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if appointment exists and belongs to the same service
    db.get(
      "SELECT * FROM Appointment WHERE appointment_id = ?",
      [appointment_id],
      (err, appointment) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!appointment) {
          return res.status(404).json({ error: "Appointment not found" });
        }
        if (appointment.service_id !== payment.service_id) {
          return res.status(400).json({ 
            error: "Appointment does not belong to the same service as the payment" 
          });
        }

        // Check if invoice already exists for this appointment
        db.get(
          "SELECT * FROM Invoices WHERE appointment_id = ?",
          [appointment_id],
          (err, existingInvoice) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            if (existingInvoice) {
              return res.status(400).json({ error: "Invoice already exists for this appointment" });
            }

            // Check if total invoices would exceed payment amount
            db.get(
              "SELECT SUM(amount) as total_invoiced FROM Invoices WHERE payment_id = ?",
              [payment_id],
              (err, result) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                const currentInvoiced = result.total_invoiced || 0;
                const newTotal = currentInvoiced + amount;

                if (newTotal > payment.total_amount) {
                  return res.status(400).json({
                    error: "Total invoices would exceed payment total amount",
                    payment_total: payment.total_amount,
                    current_invoiced: currentInvoiced,
                    remaining_to_invoice: payment.total_amount - currentInvoiced,
                    requested_amount: amount
                  });
                }

                // Create invoice
                const query = `
                  INSERT INTO Invoices (payment_id, appointment_id, amount, description)
                  VALUES (?, ?, ?, ?)
                `;

                db.run(query, [payment_id, appointment_id, amount, description], function (err) {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }

                  const invoice_id = this.lastID;

                  // Update payment: paid_amount = sum of all invoices
                  const newPaidAmount = newTotal;
                  
                  // Determine payment status
                  let paymentStatus;
                  if (newPaidAmount >= payment.total_amount) {
                    paymentStatus = 'completed';
                  } else if (newPaidAmount > 0) {
                    paymentStatus = 'partially_paid';
                  } else {
                    paymentStatus = 'unpaid';
                  }

                  // Update Payment table
                  const updatePaymentQuery = `
                    UPDATE Payment 
                    SET paid_amount = ?, status = ?
                    WHERE payment_id = ?
                  `;

                  db.run(updatePaymentQuery, [newPaidAmount, paymentStatus, payment_id], function(err) {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }

                    res.status(201).json({
                      message: "Invoice created successfully",
                      invoice: {
                        invoice_id,
                        payment_id,
                        appointment_id,
                        amount,
                        description
                      },
                      payment_update: {
                        paid_amount: newPaidAmount,
                        status: paymentStatus,
                        remaining_amount: payment.total_amount - newPaidAmount
                      },
                      summary: {
                        total_invoiced: newTotal,
                        remaining_to_invoice: payment.total_amount - newTotal
                      }
                    });
                  });
                });
              }
            );
          }
        );
      }
    );
  });
};

// Get all invoices
exports.getAllInvoices = (req, res) => {
  const query = `
    SELECT 
      i.*,
      p.total_amount as payment_total,
      p.paid_amount,
      p.status as payment_status,
      a.appointment_date,
      a.status as appointment_status,
      s.service_name,
      s.patient_id
    FROM Invoices i
    LEFT JOIN Payment p ON i.payment_id = p.payment_id
    LEFT JOIN Appointment a ON i.appointment_id = a.appointment_id
    LEFT JOIN Services s ON p.service_id = s.service_id
    ORDER BY i.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ invoices: rows });
  });
};

// Get invoice by ID
exports.getInvoiceById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      i.*,
      p.payment_id,
      p.total_amount as payment_total,
      p.paid_amount,
      p.status as payment_status,
      a.appointment_date,
      a.status as appointment_status,
      a.description as appointment_description,
      s.service_id,
      s.service_name,
      s.patient_id
    FROM Invoices i
    LEFT JOIN Payment p ON i.payment_id = p.payment_id
    LEFT JOIN Appointment a ON i.appointment_id = a.appointment_id
    LEFT JOIN Services s ON p.service_id = s.service_id
    WHERE i.invoice_id = ?
  `;

  db.get(query, [id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ invoice });
  });
};

// Get all invoices for a specific payment
exports.getInvoicesByPaymentId = (req, res) => {
  const { payment_id } = req.params;

  // Check if payment exists
  db.get("SELECT * FROM Payment WHERE payment_id = ?", [payment_id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const query = `
      SELECT 
        i.*,
        a.appointment_date,
        a.status as appointment_status,
        a.description as appointment_description
      FROM Invoices i
      LEFT JOIN Appointment a ON i.appointment_id = a.appointment_id
      WHERE i.payment_id = ?
      ORDER BY i.created_at ASC
    `;

    db.all(query, [payment_id], (err, invoices) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);

      res.json({
        invoices,
        summary: {
          payment_total: payment.total_amount,
          total_invoiced: totalInvoiced,
          remaining_to_invoice: payment.total_amount - totalInvoiced,
          invoice_count: invoices.length
        }
      });
    });
  });
};

// Update invoice
exports.updateInvoice = (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  db.get("SELECT * FROM Invoices WHERE invoice_id = ?", [id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const updates = [];
    const values = [];

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: "amount must be greater than 0" });
      }

      // Check if new amount would exceed payment total
      db.get(
        `SELECT 
          SUM(CASE WHEN invoice_id != ? THEN amount ELSE 0 END) as other_invoices,
          p.total_amount
        FROM Invoices i
        LEFT JOIN Payment p ON i.payment_id = p.payment_id
        WHERE i.payment_id = ?
        GROUP BY p.total_amount`,
        [id, invoice.payment_id],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const otherInvoicesTotal = result.other_invoices || 0;
          const newTotal = otherInvoicesTotal + amount;

          if (newTotal > result.total_amount) {
            return res.status(400).json({
              error: "Updated amount would exceed payment total",
              payment_total: result.total_amount,
              other_invoices_total: otherInvoicesTotal,
              available_for_this_invoice: result.total_amount - otherInvoicesTotal,
              requested_amount: amount
            });
          }

          updates.push("amount = ?");
          values.push(amount);

          if (description !== undefined) {
            updates.push("description = ?");
            values.push(description);
          }

          if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
          }

          values.push(id);
          const query = `UPDATE Invoices SET ${updates.join(", ")} WHERE invoice_id = ?`;

          db.run(query, values, function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Recalculate payment paid_amount and status
            db.get(
              "SELECT SUM(amount) as total_invoiced FROM Invoices WHERE payment_id = ?",
              [invoice.payment_id],
              (err, sumResult) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                const totalInvoiced = sumResult.total_invoiced || 0;
                
                // Determine payment status
                let paymentStatus;
                if (totalInvoiced >= result.total_amount) {
                  paymentStatus = 'completed';
                } else if (totalInvoiced > 0) {
                  paymentStatus = 'partially_paid';
                } else {
                  paymentStatus = 'unpaid';
                }

                // Update Payment table
                db.run(
                  "UPDATE Payment SET paid_amount = ?, status = ? WHERE payment_id = ?",
                  [totalInvoiced, paymentStatus, invoice.payment_id],
                  (err) => {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }

                    db.get("SELECT * FROM Invoices WHERE invoice_id = ?", [id], (err, updatedInvoice) => {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }

                      res.json({
                        message: "Invoice updated successfully",
                        invoice: updatedInvoice,
                        payment_update: {
                          paid_amount: totalInvoiced,
                          status: paymentStatus,
                          remaining_amount: result.total_amount - totalInvoiced
                        }
                      });
                    });
                  }
                );
              }
            );
          });
        }
      );
    } else {
      if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      values.push(id);
      const query = `UPDATE Invoices SET ${updates.join(", ")} WHERE invoice_id = ?`;

      db.run(query, values, function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        db.get("SELECT * FROM Invoices WHERE invoice_id = ?", [id], (err, updatedInvoice) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            message: "Invoice updated successfully",
            invoice: updatedInvoice
          });
        });
      });
    }
  });
};

// Delete invoice
exports.deleteInvoice = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM Invoices WHERE invoice_id = ?", [id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    db.run("DELETE FROM Invoices WHERE invoice_id = ?", [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Recalculate payment paid_amount and status after deletion
      db.get(
        "SELECT SUM(amount) as total_invoiced, p.total_amount FROM Invoices i LEFT JOIN Payment p ON i.payment_id = p.payment_id WHERE i.payment_id = ? GROUP BY p.total_amount",
        [invoice.payment_id],
        (err, result) => {
          const totalInvoiced = result ? (result.total_invoiced || 0) : 0;
          const totalAmount = result ? result.total_amount : 0;
          
          // Get total_amount from Payment if no invoices left
          if (!result) {
            db.get("SELECT total_amount FROM Payment WHERE payment_id = ?", [invoice.payment_id], (err, payment) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Update Payment table to unpaid with 0 paid_amount
              db.run(
                "UPDATE Payment SET paid_amount = 0, status = 'unpaid' WHERE payment_id = ?",
                [invoice.payment_id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }

                  res.json({
                    message: "Invoice deleted successfully",
                    invoice_id: id,
                    payment_update: {
                      paid_amount: 0,
                      status: 'unpaid',
                      remaining_amount: payment.total_amount
                    }
                  });
                }
              );
            });
          } else {
            // Determine payment status
            let paymentStatus;
            if (totalInvoiced >= totalAmount) {
              paymentStatus = 'completed';
            } else if (totalInvoiced > 0) {
              paymentStatus = 'partially_paid';
            } else {
              paymentStatus = 'unpaid';
            }

            // Update Payment table
            db.run(
              "UPDATE Payment SET paid_amount = ?, status = ? WHERE payment_id = ?",
              [totalInvoiced, paymentStatus, invoice.payment_id],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                res.json({
                  message: "Invoice deleted successfully",
                  invoice_id: id,
                  payment_update: {
                    paid_amount: totalInvoiced,
                    status: paymentStatus,
                    remaining_amount: totalAmount - totalInvoiced
                  }
                });
              }
            );
          }
        }
      );
    });
  });
};