import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Payments.css";
import DeleteModal from "../components/DeleteModalInvoice";
import AddBillForm from "./Add_new_bill.jsx";

const PaymentTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // Set default date range to last 90 days
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(ninetyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingDate, setSelectingDate] = useState("start");
  const [currentMonth, setCurrentMonth] = useState(today);
  const [sortBy, setSortBy] = useState("date");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const datePickerRef = useRef(null);
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        console.log('Fetching payments...');
        
        const response = await fetch('http://localhost:5000/api/payments');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Payments data received:', data);

        if (!data.payments || !Array.isArray(data.payments)) {
          throw new Error('Invalid data format received from server');
        }

        // Fetch all patients first to avoid multiple API calls
        let patientsMap = {};
        try {
          const patientsResponse = await fetch('http://localhost:5000/api/patients');
          if (patientsResponse.ok) {
            const patientsData = await patientsResponse.json();
            console.log('Patients data:', patientsData);
            
            // Create a map of patient_id to patient info
            // Handle multiple response formats: array, { patients: [...] }, or { value: [...] }
            let patientsList = [];
            if (Array.isArray(patientsData)) {
              patientsList = patientsData;
            } else if (patientsData.patients && Array.isArray(patientsData.patients)) {
              patientsList = patientsData.patients;
            } else if (patientsData.value && Array.isArray(patientsData.value)) {
              patientsList = patientsData.value;
            }
            
            patientsMap = patientsList.reduce((acc, patient) => {
              acc[patient.patient_id] = patient;
              return acc;
            }, {});
            
            console.log('Patients map created:', patientsMap);
          }
        } catch (err) {
          console.error('Error fetching patients (will use fallback):', err);
        }

        // Transform backend data to match frontend expectations
        const transformedData = data.payments.map((payment) => {
          // Get patient name from the map
          let patientName = 'Unknown Patient';
          const patient = patientsMap[payment.patient_id];
          if (patient) {
            patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient';
          }

          // Determine status based on payment status
          let displayStatus;
          switch (payment.status) {
            case 'completed':
              displayStatus = 'Completed';
              break;
            case 'partially_paid':
              displayStatus = 'In Progress';
              break;
            case 'unpaid':
            default:
              displayStatus = 'Unpaid';
              break;
          }

          // Parse and format the date
          let formattedDate = 'N/A';
          if (payment.created_at) {
            try {
              const date = new Date(payment.created_at);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            } catch (err) {
              console.error('Error parsing date:', err);
            }
          }

          return {
            id: payment.payment_id,
            patientName: patientName,
            date: formattedDate,
            services: payment.service_name || 'General Service',
            totalCharge: parseFloat(payment.total_amount) || 0,
            amountPaid: parseFloat(payment.paid_amount) || 0,
            outstanding: parseFloat(payment.remaining_amount) || 0,
            status: displayStatus,
            // Keep original for reference
            service_id: payment.service_id,
            description: payment.description,
            rawDate: payment.created_at
          };
        });

        console.log('Transformed data:', transformedData);
        setPayments(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(`Failed to load payments: ${err.message}`);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Calculate totals
  const totalOutstanding = payments.reduce((sum, p) => sum + p.outstanding, 0);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const overdueInvoices = payments.filter((p) => p.status === "Unpaid").length;

  // Filter and sort payments
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      // Date filtering - use rawDate for accurate comparison
      let matchesDateRange = true;
      if (payment.rawDate) {
        try {
          const paymentDate = new Date(payment.rawDate);
          matchesDateRange = paymentDate >= startDate && paymentDate <= endDate;
        } catch (err) {
          console.error('Error comparing dates:', err);
        }
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.rawDate ? new Date(a.rawDate) : new Date(0);
        const dateB = b.rawDate ? new Date(b.rawDate) : new Date(0);
        return dateB - dateA;
      }
      if (sortBy === "total charge") return b.totalCharge - a.totalCharge;
      if (sortBy === "outstanding") return b.outstanding - a.outstanding;
      return 0;
    });

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "completed";
      case "In Progress":
        return "in-progress";
      case "Unpaid":
        return "unpaid";
      default:
        return "";
    }
  };

  const getOutstandingClass = (outstanding, status) => {
    if (outstanding === 0) return "zero";
    if (status === "Unpaid") return "unpaid";
    return "partial";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDateRange = () => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return `${startDate.toLocaleDateString(
      "en-US",
      options
    )} - ${endDate.toLocaleDateString("en-US", options)}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isInRange = (date) => {
    return date >= startDate && date <= endDate;
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (selectingDate === "start") {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
      setSelectingDate("end");
    } else {
      if (selectedDate < startDate) {
        setEndDate(startDate);
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      setShowDatePicker(false);
      setSelectingDate("start");
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleEdit = (payment) => {
    // Navigate to edit page with payment data
    navigate('/add_bill', { state: { payment } });
    setActiveMenu(null);
  };

  const handleDelete = (payment) => {
    setSelectedPayment(payment);
    setDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = async (payment) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/payments/${payment.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }

      // Remove the payment from state
      setPayments((prevPayments) =>
        prevPayments.filter((p) => p.id !== payment.id)
      );
      setDeleteModalOpen(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert(err.message || 'Failed to delete payment. Please try again.');
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedPayment(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".dropdown-wrapper") &&
        !e.target.closest(".date-picker-wrapper") &&
        !e.target.closest(".action-menu-wrapper")
      ) {
        setShowStatusDropdown(false);
        setShowSortDropdown(false);
        setShowDatePicker(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isStart = isSameDay(date, startDate);
      const isEnd = isSameDay(date, endDate);
      const inRange = isInRange(date);

      let className = "calendar-day";
      if (isStart) className += " start-date";
      if (isEnd) className += " end-date";
      if (inRange && !isStart && !isEnd) className += " in-range";

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="calendar-picker">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="calendar-nav-btn">
            <ChevronLeft size={20} />
          </button>
          <div className="calendar-month">{monthName}</div>
          <button onClick={handleNextMonth} className="calendar-nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{days}</div>
        <div className="calendar-footer">
          <span className="calendar-instruction">
            {selectingDate === "start"
              ? "Select start date"
              : "Select end date"}
          </span>
        </div>
      </div>
    );
  };

  const renderActionMenu = (payment) => {
    if (activeMenu !== payment.id) return null;

    return (
      <div className="action-dropdown">
        <button className="action-item" onClick={() => handleEdit(payment)}>
          Edit Payment
        </button>
        <button
          className="action-item danger"
          onClick={() => handleDelete(payment)}
        >
          Delete Payment
        </button>
      </div>
    );
  };

  return (
    <div className="payments-page">
      <main className="payments-main">
        <h1 className="page-title">Payment Tracking & History</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Outstanding Balance</p>
            <p className="stat-value">{formatCurrency(totalOutstanding)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Revenue (This Month)</p>
            <p className="stat-value">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="filters-container">
          <div className="filters-row">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by patient name"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-buttons-group">
              <div className="date-picker-wrapper" ref={datePickerRef}>
                <button
                  className="filter-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDatePicker(!showDatePicker);
                    setShowStatusDropdown(false);
                    setShowSortDropdown(false);
                  }}
                >
                  <Calendar className="filter-btn-icon" size={20} />
                  <span>{formatDateRange()}</span>
                  <ChevronDown size={16} />
                </button>
                {showDatePicker && renderCalendar()}
              </div>

              <div className="dropdown-wrapper">
                <button
                  className="filter-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowSortDropdown(false);
                    setShowDatePicker(false);
                  }}
                >
                  <span>Status: {statusFilter}</span>
                  <ChevronDown size={16} />
                </button>
                {showStatusDropdown && (
                  <div className="dropdown-menu">
                    {["All", "Completed", "In Progress", "Unpaid"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowStatusDropdown(false);
                          }}
                          className="dropdown-item"
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="dropdown-wrapper">
                <button
                  className="filter-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown(!showSortDropdown);
                    setShowStatusDropdown(false);
                    setShowDatePicker(false);
                  }}
                >
                  <span>Sort By</span>
                  <ChevronDown size={16} />
                </button>
                {showSortDropdown && (
                  <div className="dropdown-menu">
                    {[
                      { value: "date", label: "Date" },
                      { value: "total charge", label: "Total Charge" },
                      { value: "outstanding", label: "Outstanding" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className="dropdown-item"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Services Rendered</th>
                <th>Total Charge</th>
                <th>Amount Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    Loading payments...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    {error}
                    <br />
                    <small>Check browser console for details</small>
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="patient-name">{payment.patientName}</td>
                    <td className="service-date">{payment.date}</td>
                    <td className="service-text">{payment.services}</td>
                    <td className="amount-text">
                      {formatCurrency(payment.totalCharge)}
                    </td>
                    <td className="amount-text">
                      {formatCurrency(payment.amountPaid)}
                    </td>
                    <td
                      className={`outstanding-amount ${getOutstandingClass(
                        payment.outstanding,
                        payment.status
                      )}`}
                    >
                      {formatCurrency(payment.outstanding)}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search size={48} />
                      </div>
                      <h3 className="empty-state-title">No payments found</h3>
                      <p className="empty-state-text">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        invoice={selectedPayment}
      />
    </div>
  );
};

export default PaymentTracking;