import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const RegistrationSettings = () => {
  const [settings, setSettings] = useState({
    registrationStartDate: '',
    registrationEndDate: '',
    maxStudents: 100,
    isRegistrationOpen: true
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getRegistrationStats();
      const data = response.data.data;

      // Format dates for input fields
      const formatDateForInput = (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      setSettings({
        registrationStartDate: formatDateForInput(data.settings.registrationStartDate),
        registrationEndDate: formatDateForInput(data.settings.registrationEndDate),
        maxStudents: data.settings.maxStudents,
        isRegistrationOpen: data.settings.isRegistrationOpen
      });

      setStats(data.statistics);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load registration settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate dates
    const start = new Date(settings.registrationStartDate);
    const end = new Date(settings.registrationEndDate);

    if (start >= end) {
      setError('Start date must be before end date');
      setLoading(false);
      return;
    }

    try {
      await adminAPI.updateSettings(settings);
      setMessage('Settings updated successfully!');
      loadSettings(); // Reload to get updated stats
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!settings.isRegistrationOpen) return '#DC2626';
    if (!stats) return '#0060AA';

    const now = new Date();
    const start = new Date(settings.registrationStartDate);
    const end = new Date(settings.registrationEndDate);

    if (now < start) return '#D97706';
    if (now > end) return '#DC2626';
    if (stats.remainingSlots === 0) return '#DC2626';

    return '#059669';
  };

  const getStatusText = () => {
    if (!settings.isRegistrationOpen) return 'Manually Closed';
    if (!stats) return 'Loading...';

    const now = new Date();
    const start = new Date(settings.registrationStartDate);
    const end = new Date(settings.registrationEndDate);

    if (now < start) return 'Opens Soon';
    if (now > end) return 'Period Ended';
    if (stats.remainingSlots === 0) return 'Quota Full';

    return 'Open';
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header with Status */}
      <div style={{
        background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
            Registration Control Settings
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            Manage student registration dates and capacity limits
          </p>
        </div>
        <div style={{
          background: getStatusColor(),
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '700',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          {getStatusText()}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
            color: 'white',
            padding: '20px'
          }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Total Students</div>
            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace' }}>
              {stats.totalStudents}
            </div>
          </div>

          <div className="card" style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            padding: '20px'
          }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Verified Students</div>
            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace' }}>
              {stats.verifiedStudents}
            </div>
          </div>

          <div className="card" style={{
            background: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
            color: 'white',
            padding: '20px'
          }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Pending Verification</div>
            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace' }}>
              {stats.pendingStudents}
            </div>
          </div>

          <div className="card" style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            color: 'white',
            padding: '20px'
          }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Remaining Slots</div>
            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace' }}>
              {stats.remainingSlots}
            </div>
          </div>

          <div className="card" style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
            color: 'white',
            padding: '20px'
          }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Capacity Used</div>
            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace' }}>
              {stats.capacityPercentage}%
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
          Update Registration Settings
        </h3>

        {message && (
          <div style={{
            background: '#D1FAE5',
            border: '1px solid #059669',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span> {message}
          </div>
        )}

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

        <form onSubmit={handleSubmit}>
          {/* Date Range */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                Registration Start Date *
              </label>
              <input
                type="date"
                value={settings.registrationStartDate}
                onChange={(e) => setSettings({ ...settings, registrationStartDate: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#1F2937',
                fontSize: '14px'
              }}>
                Registration End Date *
              </label>
              <input
                type="date"
                value={settings.registrationEndDate}
                onChange={(e) => setSettings({ ...settings, registrationEndDate: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Max Students */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1F2937',
              fontSize: '14px'
            }}>
              Maximum Students Allowed *
            </label>
            <input
              type="number"
              value={settings.maxStudents}
              onChange={(e) => setSettings({ ...settings, maxStudents: parseInt(e.target.value) })}
              required
              min={stats?.verifiedStudents || 1}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {stats && (
              <small style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginTop: '6px' }}>
                Current verified students: {stats.verifiedStudents}. Quota cannot be set below this number.
              </small>
            )}
          </div>

          {/* Manual Override */}
          <div style={{
            background: '#F9FAFB',
            border: '2px solid #E5E7EB',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1F2937'
            }}>
              <input
                type="checkbox"
                checked={settings.isRegistrationOpen}
                onChange={(e) => setSettings({ ...settings, isRegistrationOpen: e.target.checked })}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              <div>
                <div>Allow Student Registration</div>
                <div style={{ fontWeight: '400', color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>
                  Uncheck this to manually close registration regardless of date range or quota
                </div>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
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
              boxShadow: loading ? 'none' : '0 4px 12px rgba(0, 96, 170, 0.3)'
            }}
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
                Updating...
              </>
            ) : (
              <>
                <span>💾</span>
                Save Settings
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistrationSettings;
