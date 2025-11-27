import React, { useState } from 'react';
import './AnalyticsDashboard.css';

// KPI Card Component
const KPICard = ({ icon, label, value, change, changeType }) => (
  <div className="kpi-card">
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-content">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {change && (
        <span className={`kpi-change ${changeType}`}>
          {changeType === 'positive' ? '+' : ''}{change}
        </span>
      )}
    </div>
  </div>
);

// Data Table Component
const DataTable = ({ title, columns, data, actions }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.length === data.length
        ? []
        : data.map(row => row.id)
    );
  };

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <h3 className="data-table-title">{title}</h3>
        {actions && (
          <div className="data-table-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`btn btn-${action.variant || 'secondary'} btn-sm`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={toggleAll}
                />
              </th>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>
                {columns.map((col, index) => (
                  <td key={index}>
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="data-table-footer">
        <span className="data-table-info">
          Showing 1-{data.length} of {data.length}
        </span>
        <div className="data-table-pagination">
          <button className="pagination-btn" disabled>Previous</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    completed: 'badge-success',
    pending: 'badge-warning',
    active: 'badge-info',
    cancelled: 'badge-danger'
  };

  return (
    <span className={`status-badge ${statusStyles[status.toLowerCase()] || 'badge-secondary'}`}>
      {status}
    </span>
  );
};

// Chart Placeholder Component
const ChartPlaceholder = ({ title, type, height = 280 }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-controls">
        <button className="chart-control-btn active">Daily</button>
        <button className="chart-control-btn">Weekly</button>
        <button className="chart-control-btn">Monthly</button>
      </div>
    </div>
    <div className="chart-body" style={{ height: `${height}px` }}>
      <div className="chart-placeholder">
        <svg viewBox="0 0 400 200" className="chart-svg">
          {type === 'line' && (
            <>
              <path
                d="M 0 150 Q 50 120 100 130 T 200 100 T 300 80 T 400 60"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
              />
              <path
                d="M 0 150 Q 50 120 100 130 T 200 100 T 300 80 T 400 60 L 400 200 L 0 200 Z"
                fill="var(--color-primary)"
                opacity="0.1"
              />
            </>
          )}
          {type === 'bar' && (
            <>
              <rect x="20" y="120" width="40" height="80" fill="var(--color-primary)" opacity="0.8" rx="4" />
              <rect x="80" y="80" width="40" height="120" fill="var(--color-primary)" opacity="0.8" rx="4" />
              <rect x="140" y="100" width="40" height="100" fill="var(--color-primary)" opacity="0.8" rx="4" />
              <rect x="200" y="60" width="40" height="140" fill="var(--color-primary)" opacity="0.8" rx="4" />
              <rect x="260" y="90" width="40" height="110" fill="var(--color-primary)" opacity="0.8" rx="4" />
              <rect x="320" y="70" width="40" height="130" fill="var(--color-primary)" opacity="0.8" rx="4" />
            </>
          )}
        </svg>
      </div>
    </div>
  </div>
);

// Main Analytics Dashboard Component
const AnalyticsDashboard = () => {
  // Sample KPI data
  const kpiData = [
    {
      icon: '$',
      label: 'Total Revenue',
      value: '$124,563.00',
      change: '12.5%',
      changeType: 'positive'
    },
    {
      icon: '#',
      label: 'Total Users',
      value: '8,549',
      change: '8.2%',
      changeType: 'positive'
    },
    {
      icon: '%',
      label: 'Conversion Rate',
      value: '3.24%',
      change: '1.1%',
      changeType: 'positive'
    },
    {
      icon: '!',
      label: 'Bounce Rate',
      value: '42.3%',
      change: '-2.4%',
      changeType: 'negative'
    }
  ];

  // Sample table data
  const tableColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Amount', accessor: 'amount' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => <StatusBadge status={value} />
    },
    { header: 'Date', accessor: 'date' }
  ];

  const tableData = [
    { id: '#12345', customer: 'John Doe', amount: '$1,234.00', status: 'Completed', date: 'Nov 18, 2025' },
    { id: '#12346', customer: 'Jane Smith', amount: '$567.00', status: 'Pending', date: 'Nov 18, 2025' },
    { id: '#12347', customer: 'Bob Wilson', amount: '$2,891.00', status: 'Completed', date: 'Nov 17, 2025' },
    { id: '#12348', customer: 'Alice Brown', amount: '$432.00', status: 'Active', date: 'Nov 17, 2025' },
    { id: '#12349', customer: 'Charlie Davis', amount: '$1,876.00', status: 'Completed', date: 'Nov 16, 2025' }
  ];

  const tableActions = [
    { label: 'Filter', variant: 'secondary' },
    { label: 'Export', variant: 'secondary' },
    { label: '+ Add', variant: 'primary' }
  ];

  return (
    <div className="analytics-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">Export Report</button>
          <button className="btn btn-primary">+ New Entry</button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-primary">
          <ChartPlaceholder
            title="Revenue Overview"
            type="line"
            height={280}
          />
        </div>
        <div className="chart-secondary">
          <ChartPlaceholder
            title="Traffic Sources"
            type="bar"
            height={280}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Recent Transactions"
        columns={tableColumns}
        data={tableData}
        actions={tableActions}
      />

      {/* Form Section */}
      <div className="form-section">
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="search">Search</label>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="Search transactions..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateRange">Date Range</label>
              <select id="dateRange" className="form-control">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" className="form-control">
                <option>All statuses</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Active</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="form-group form-actions">
              <button className="btn btn-primary">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
