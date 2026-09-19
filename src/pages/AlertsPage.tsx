import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { AlertTable } from '../components/alerts/AlertTable';
import { AlertDetails } from '../components/alerts/AlertDetails';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Select } from '../components/common/Select';
import { SearchInput } from '../components/common/SearchInput';
import { mockAlerts } from '../data/mockAlerts';
import { Alert } from '../types/alert';
import { Badge } from '../components/common/Badge';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingAlert, setInspectingAlert] = useState<Alert | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        selectedSeverity === 'ALL' || a.severity === selectedSeverity;

      const matchesStatus =
        selectedStatus === 'ALL' || a.status === selectedStatus;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, selectedSeverity, selectedStatus]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Acknowledged' } : a))
    );
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Active Early-Warning Alerts"
        description="High-priority surveillance alerts triggered by high OCR overlap, temporal anomalies, or digital watermark detections."
        badge={<Badge variant="danger">{filteredAlerts.length} Active Alerts</Badge>}
      />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter alerts by subject or reason..."
        />

        <Select
          label="Alert Severity"
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Severities' },
            { value: 'HIGH', label: 'High Severity' },
            { value: 'MEDIUM', label: 'Medium Severity' },
            { value: 'LOW', label: 'Low Severity' },
          ]}
        />

        <Select
          label="Alert Lifecycle Status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'New', label: 'New / Unacknowledged' },
            { value: 'Under Review', label: 'Under Review' },
            { value: 'Acknowledged', label: 'Acknowledged' },
            { value: 'Resolved', label: 'Resolved' },
          ]}
        />
      </div>

      {filteredAlerts.length > 0 ? (
        <AlertTable
          alerts={filteredAlerts}
          onAcknowledge={handleAcknowledge}
          onSelectAlert={(a) => setInspectingAlert(a)}
        />
      ) : (
        <EmptyState
          title="No Alerts Match Your Filter"
          description="Try selecting 'All Severities' or 'All Statuses' to view historical alert logs."
        />
      )}

      {/* Alert Details Modal */}
      {inspectingAlert && (
        <Modal
          isOpen={!!inspectingAlert}
          onClose={() => setInspectingAlert(null)}
          title={`Alert Details: ${inspectingAlert.id}`}
        >
          <AlertDetails
            alert={inspectingAlert}
            onAcknowledge={(id) => {
              handleAcknowledge(id);
              setInspectingAlert(null);
            }}
          />
        </Modal>
      )}
    </ResponsiveContainer>
  );
};
