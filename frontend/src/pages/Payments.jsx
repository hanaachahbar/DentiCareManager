import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronDown, MoreVertical, Bell, User } from 'lucide-react';
import '../styles/Payments.css';

const paymentsData = [
  { id: 1, patientName: "John Doe", invoiceNumber: "INV-00123", date: "2023-10-25", servicesRendered: "Cleaning, X-Ray", category: "General", totalCharge: 250.00, amountPaid: 250.00, outstanding: 0.00, status: "completed" },
  { id: 2, patientName: "Jane Smith", invoiceNumber: "INV-00122", date: "2023-10-24", servicesRendered: "Root Canal", category: "ODF", totalCharge: 1200.00, amountPaid: 600.00, outstanding: 600.00, status: "in_progress" },
  { id: 3, patientName: "Mike Johnson", invoiceNumber: "INV-00121", date: "2023-10-22", servicesRendered: "Crown Fitting", category: "Restorative", totalCharge: 850.00, amountPaid: 0.00, outstanding: 850.00, status: "unpaid" },
  { id: 4, patientName: "Emily Davis", invoiceNumber: "INV-00120", date: "2023-10-21", servicesRendered: "Check-up", category: "General", totalCharge: 100.00, amountPaid: 100.00, outstanding: 0.00, status: "completed" },
  { id: 5, patientName: "Sarah Wilson", invoiceNumber: "INV-00119", date: "2023-10-20", servicesRendered: "Teeth Whitening", category: "Cosmetic", totalCharge: 450.00, amountPaid: 450.00, outstanding: 0.00, status: "completed" },
  { id: 6, patientName: "Robert Brown", invoiceNumber: "INV-00118", date: "2023-10-18", servicesRendered: "Cavity Filling", category: "Restorative", totalCharge: 300.00, amountPaid: 150.00, outstanding: 150.00, status: "in_progress" },
  { id: 7, patientName: "Lisa Anderson", invoiceNumber: "INV-00117", date: "2023-10-15", servicesRendered: "Dental Implant", category: "Surgical", totalCharge: 3500.00, amountPaid: 0.00, outstanding: 3500.00, status: "unpaid" },
  { id: 8, patientName: "David Martinez", invoiceNumber: "INV-00116", date: "2023-10-12", servicesRendered: "Braces Adjustment", category: "Orthodontic", totalCharge: 200.00, amountPaid: 200.00, outstanding: 0.00, status: "completed" }
];

const PaymentTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '2023-10-05', end: '2023-10-30' });
  const [sortBy, setSortBy] = useState('date');

  const statistics = useMemo(() => {
    const totalOutstanding = paymentsData.reduce((sum, p) => sum + p.outstanding, 0);
    const totalRevenue = paymentsData.reduce((sum, p) => sum + p.amountPaid, 0);
    const overdueCount = paymentsData.filter(p => p.status === 'unpaid').length;
    return {
      totalOutstanding: totalOutstanding.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      overdueCount
    };
  }, []);

  const filteredPayments = useMemo(() => {
    return paymentsData
      .filter(p => {
        const matchesSearch = p.patientName.toLowerCase().includes(searchTerm.toLowerCase())
          || p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const paymentDate = new Date(p.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        const matchesDate = paymentDate >= startDate && paymentDate <= endDate;
        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'amount') return b.totalCharge - a.totalCharge;
        return 0;
      });
  }, [searchTerm, statusFilter, dateRange, sortBy]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'status-badge completed';
      case 'in_progress': return 'status-badge in-progress';
      case 'unpaid': return 'status-badge unpaid';
      default: return 'status-badge';
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="payment-page">
      {/* Header */}
      <header className="payment-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-container">
                <div className="logo-icon"></div>
                <span className="logo-text">DentalDash</span>
              </div>
              <nav className="header-nav">
                <button className="nav-button">Dashboard</button>
                <button className="nav-button">Patients</button>
                <button className="nav-button">Appointments</button>
                <button className="nav-button active">Billing</button>
              </nav>
            </div>
            <div className="header-right">
              <button className="icon-button"><Bell /></button>
              <button className="icon-button user-button"><User /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Payment Tracking & History</h1>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Outstanding Balance</p>
            <p className="stat-value">${statistics.totalOutstanding}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Revenue (This Month)</p>
            <p className="stat-value">${statistics.totalRevenue}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Overdue Invoices</p>
            <p className="stat-value warning">{statistics.overdueCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filters-grid">
            <div className="input-group">
              <Search className="input-icon"/>
              <input type="text" placeholder="Search by patient name or ID" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input with-icon"/>
            </div>
            <div className="input-group">
              <Calendar className="input-icon"/>
              <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="form-input with-icon"/>
            </div>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="form-input"/>
            <div className="input-group">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select">
                <option value="all">  Status: All</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <ChevronDown className="input-icon" />
            </div>
          </div>
          <div className="filters-footer">
            <p className="results-count">Showing {filteredPayments.length} of {paymentsData.length} results</p>
            <div className="sort-container">
              <span className="sort-label">Sort By</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Services Rendered</th>
                  <th>Category</th>
                  <th className="text-right">Total Charge</th>
                  <th className="text-right">Amount Paid</th>
                  <th className="text-right">Outstanding</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td className="patient-name">{p.patientName}</td>
                    <td className="invoice-number">{p.invoiceNumber}</td>
                    <td>{formatDate(p.date)}</td>
                    <td className="service-info">{p.servicesRendered}</td>
                    <td className="category-info">{p.category}</td>
                    <td className="text-right">{formatCurrency(p.totalCharge)}</td>
                    <td className="text-right">{formatCurrency(p.amountPaid)}</td>
                    <td className={`text-right outstanding-amount ${p.outstanding>0?'has-balance':'paid'}`}>{formatCurrency(p.outstanding)}</td>
                    <td className="text-center"><span className={getStatusClass(p.status)}>{p.status.replace('_',' ')}</span></td>
                    <td className="text-center"><button className="action-button"><MoreVertical/></button></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      <p className="empty-state-title">No payments found matching your criteria</p>
                      <p className="empty-state-subtitle">Try adjusting your filters or search term</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentTracking;
