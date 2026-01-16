import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate Report
  const handleGenerateReport = async () => {
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);

    try {
      const response = await adminAPI.getReports(startDate, endDate);
      setReportData(response.data.data);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Download PDF Report
  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 96, 170);
    doc.rect(0, 0, 210, 50, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Internship Management System', 105, 20, { align: 'center' });

    doc.setFontSize(18);
    doc.text('Statistical Report', 105, 35, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    let yPos = 60;

    // Date Range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Period:', 14, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`From: ${formatDate(reportData.dateRange.startDate)}`, 14, yPos);
    yPos += 6;
    doc.text(`To: ${formatDate(reportData.dateRange.endDate)}`, 14, yPos);
    yPos += 15;

    // Main Statistics Table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview Statistics', 14, yPos);
    yPos += 7;

    const statsData = [
      ['Total Applications', reportData.statistics.totalApplications],
      ['Rejected Applications', reportData.statistics.rejectedApplications],
      ['Active Interns', reportData.statistics.activeInterns],
      ['Completed Internships', reportData.statistics.completedInternships],
      ['Pending Applications', reportData.statistics.pendingApplications]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Count']],
      body: statsData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 96, 170],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 11
      },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'center', fillColor: [240, 249, 255] }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Breakdown by Department
    if (reportData.breakdown.byDepartment.length > 0 && yPos < 250) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Applications by Department', 14, yPos);
      yPos += 7;

      const deptData = reportData.breakdown.byDepartment.map((item, index) => [
        index + 1,
        item.department,
        item.count
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Department', 'Count']],
        body: deptData,
        theme: 'striped',
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 120 },
          2: { cellWidth: 45, halign: 'center' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Breakdown by University (new page if needed)
    if (reportData.breakdown.byUniversity.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Applications by University', 14, yPos);
      yPos += 7;

      const uniData = reportData.breakdown.byUniversity.map((item, index) => [
        index + 1,
        item.university,
        item.count
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'University', 'Count']],
        body: uniData,
        theme: 'striped',
        headStyles: {
          fillColor: [217, 119, 6],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 120 },
          2: { cellWidth: 45, halign: 'center' }
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Page number
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });

      // Generation date
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 14, 280);

      // Signature line
      doc.setDrawColor(128, 128, 128);
      doc.line(14, 270, 80, 270);
      doc.text('Admin Signature', 14, 275);

      // Confidential footer
      doc.setFontSize(8);
      doc.text('Internship Management System - Confidential Report', 105, 285, { align: 'center' });
    }

    // Save PDF
    const fileName = `Internship_Report_${startDate}_to_${endDate}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="dashboard">
      <div className="container dashboard-container">
        <h1>Statistical Reports</h1>
        <p className="dashboard-subtitle">Generate comprehensive internship program reports</p>

        {/* Date Range Selection */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Select Date Range</h3>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #DC2626',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Start Date */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0060AA'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* End Date */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0060AA'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            style={{
              padding: '14px 28px',
              background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(0, 96, 170, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px',
                  height: '18px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Generating...
              </>
            ) : (
              <>
                <span style={{ fontSize: '18px' }}>📊</span>
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Statistics Display */}
        {reportData && (
          <>
            {/* Date Range Info */}
            <div style={{
              background: 'linear-gradient(135deg, #EBF5FF 0%, #CCE0F5 100%)',
              border: '1px solid #0060AA',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#004D8C', fontWeight: '600' }}>Report Period</div>
                <div style={{ fontSize: '16px', color: '#0060AA', fontWeight: '700', marginTop: '4px' }}>
                  {formatDate(reportData.dateRange.startDate)} - {formatDate(reportData.dateRange.endDate)}
                </div>
              </div>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>📄</span> Download PDF
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Total Applications */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Applications</div>
                <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {reportData.statistics.totalApplications}
                </div>
              </div>

              {/* Rejected */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Rejected</div>
                <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {reportData.statistics.rejectedApplications}
                </div>
              </div>

              {/* Active Interns */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Active Interns</div>
                <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {reportData.statistics.activeInterns}
                </div>
              </div>

              {/* Completed */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Completed Internships</div>
                <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {reportData.statistics.completedInternships}
                </div>
              </div>

              {/* Pending */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Applications</div>
                <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {reportData.statistics.pendingApplications}
                </div>
              </div>
            </div>

            {/* Breakdown by Department */}
            {reportData.breakdown.byDepartment.length > 0 && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '16px' }}>Applications by Department</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Department</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.breakdown.byDepartment.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.department}</td>
                          <td>
                            <span style={{
                              background: '#0060AA',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              {item.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Breakdown by University */}
            {reportData.breakdown.byUniversity.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Applications by University</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>University</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.breakdown.byUniversity.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.university}</td>
                          <td>
                            <span style={{
                              background: '#D97706',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              {item.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!reportData && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ marginBottom: '10px', color: '#1F2937' }}>No Report Generated</h3>
            <p style={{ color: '#6B7280', marginBottom: '0' }}>
              Select a date range above and click "Generate Report" to view statistics
            </p>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReportPage;
