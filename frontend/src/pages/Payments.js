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

const PaymentTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState(new Date(2023, 9, 5)); // Oct 5, 2023
  const [endDate, setEndDate] = useState(new Date(2023, 9, 30)); // Oct 30, 2023
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingDate, setSelectingDate] = useState("start"); // 'start' or 'end'
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 9, 1));
  const [sortBy, setSortBy] = useState("date");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const datePickerRef = useRef(null);
  const navigate = useNavigate();

  // Sample payment data
  const [payments, setPayments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      invoiceNum: "INV-00123",
      date: "Oct 25, 2023",
      services: "Cleaning, X-Ray",
      category: "General",
      totalCharge: 250.0,
      amountPaid: 250.0,
      outstanding: 0.0,
      status: "Completed",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      invoiceNum: "INV-00122",
      date: "Oct 24, 2023",
      services: "Root Canal",
      category: "ODF",
      totalCharge: 1200.0,
      amountPaid: 600.0,
      outstanding: 600.0,
      status: "In Progress",
    },
    {
      id: 3,
      patientName: "Mike Johnson",
      invoiceNum: "INV-00121",
      date: "Oct 22, 2023",
      services: "Crown Fitting",
      category: "Restorative",
      totalCharge: 850.0,
      amountPaid: 0.0,
      outstanding: 850.0,
      status: "Unpaid",
    },
    {
      id: 4,
      patientName: "Emily Davis",
      invoiceNum: "INV-00120",
      date: "Oct 21, 2023",
      services: "Check-up",
      category: "General",
      totalCharge: 100.0,
      amountPaid: 100.0,
      outstanding: 0.0,
      status: "Completed",
    },
  ]);

  // Calculate totals
  const totalOutstanding = payments.reduce((sum, p) => sum + p.outstanding, 0);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const overdueInvoices = payments.filter((p) => p.status === "Unpaid").length;

  // Filter and sort payments
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNum.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      // Date filtering
      const paymentDate = new Date(payment.date);
      const matchesDateRange =
        paymentDate >= startDate && paymentDate <= endDate;

      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
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

  // Calendar functions
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

  // Handle Edit action
  const handleEdit = (invoice) => {
    // Navigate to edit page - replace '/edit-invoice' with your actual edit route
    navigate(`/edit-invoice/${invoice.id}`, { state: { invoice } });
    setActiveMenu(null); // Close the action menu
  };

  // Handle Delete action
  const handleDelete = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModalOpen(true);
    setActiveMenu(null); // Close the action menu
  };

  // Confirm delete
  const confirmDelete = (invoice) => {
    // Remove the invoice from the payments array
    setPayments((prevPayments) =>
      prevPayments.filter((p) => p.id !== invoice.id)
    );
    setDeleteModalOpen(false);
    setSelectedInvoice(null);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedInvoice(null);
  };

  // Close dropdowns when clicking outside
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

    // Empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
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

  // Render action menu for each payment row
  const renderActionMenu = (payment) => {
    if (activeMenu !== payment.id) return null;

    return (
      <div className="action-dropdown">
        <button className="action-item" onClick={() => handleEdit(payment)}>
          Edit Invoice
        </button>
        <button
          className="action-item danger"
          onClick={() => handleDelete(payment)}
        >
          Delete Invoice
        </button>
      </div>
    );
  };

  return (
    <div className="payments-container">
      {/* Header */}
      <header className="payments-header">
        <div className="payments-header-content">
          <div className="payments-nav">
            <div className="logo-container">
              <div className="logo-icon">
                <DollarSign size={24} color="white" />
              </div>
              <span className="logo-text">DentalDash</span>
            </div>
            <nav>
              <ul className="nav-links">
                <li>
                  <a href="#" className="nav-link">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    Patients
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    Appointments
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link active">
                    Billing
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="header-actions">
            <button className="notification-btn" aria-label="Notifications">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42115 18.2537 9.16813 18.1079C8.91511 17.9622 8.70484 17.7526 8.55835 17.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="profile-avatar"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="payments-main">
        <h1 className="page-title">Payment Tracking & History</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Outstanding Balance</p>
            <p className="stat-value">{formatCurrency(totalOutstanding)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Revenue (This Month)</p>
            <p className="stat-value">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Overdue Invoices</p>
            <p className="stat-value highlight">{overdueInvoices}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filters-row">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by patient name or ID"
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

        {/* Payments Table */}
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Services Rendered</th>
                <th>Category</th>
                <th>Total Charge</th>
                <th>Amount Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="patient-name">{payment.patientName}</td>
                    <td className="invoice-number">{payment.invoiceNum}</td>
                    <td className="service-date">{payment.date}</td>
                    <td className="service-text">{payment.services}</td>
                    <td className="service-category">{payment.category}</td>
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
                    <td>
                      <div className="action-menu-wrapper">
                        <button
                          className="action-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(
                              activeMenu === payment.id ? null : payment.id
                            );
                          }}
                          aria-label="More actions"
                        >
                          <MoreVertical size={20} />
                        </button>
                        {renderActionMenu(payment)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">
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

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default PaymentTracking;
