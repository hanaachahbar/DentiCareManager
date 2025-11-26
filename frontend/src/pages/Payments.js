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
import  AddBillForm from "./Add_new_bill.jsx";
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

  const handleEdit = (invoice) => {
    navigate('/add_bill', { state: { invoice } });
    setActiveMenu(null); 
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
    <div className="payments-page">

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
                  <td colSpan="9">
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