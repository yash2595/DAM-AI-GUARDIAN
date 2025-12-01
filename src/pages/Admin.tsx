import { useState, useEffect } from 'react';
import { Download, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [sosHistory, setSosHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const endpoint = (import.meta as any).env.VITE_ACCOUNTS_ENDPOINT || 'http://127.0.0.1:4000/accounts';
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.ok) {
        setAccounts(data.accounts || []);
        toast.success(`Loaded ${data.count || 0} accounts`);
      } else {
        toast.error('Failed to load accounts');
      }
    } catch (err: any) {
      toast.error(`Error loading accounts: ${err?.message ?? 'unknown'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSosHistory = async () => {
    try {
      setLoading(true);
      const endpoint = (import.meta as any).env.VITE_SOS_HISTORY_ENDPOINT || 'http://127.0.0.1:4000/sos-history';
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.ok) {
        setSosHistory(data.history || []);
        toast.success(`Loaded ${data.count || 0} SOS alerts`);
      } else {
        toast.error('Failed to load SOS history');
      }
    } catch (err: any) {
      toast.error(`Error loading SOS history: ${err?.message ?? 'unknown'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAccountsCSV = () => {
    const endpoint = (import.meta as any).env.VITE_ACCOUNTS_DOWNLOAD_ENDPOINT || 'http://127.0.0.1:4000/accounts/download';
    window.open(endpoint, '_blank');
    toast.success('Opening CSV download...');
  };

  useEffect(() => {
    fetchAccounts();
    fetchSosHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage accounts and view system logs</p>
      </div>

      {/* Accounts Section */}
      <div className="glass-card rounded-2xl p-6 border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Registered Accounts</h2>
            <span className="text-sm text-muted-foreground">({accounts.length})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAccounts}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={downloadAccountsCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-white hover:opacity-90 text-sm"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No accounts found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, idx) => (
                  <tr key={idx} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="py-3 px-2 text-sm font-mono text-muted-foreground">{account.id?.slice(0, 8)}...</td>
                    <td className="py-3 px-2 text-sm">{account.name}</td>
                    <td className="py-3 px-2 text-sm font-mono text-primary">{account.email}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className="inline-flex px-2 py-1 rounded-md bg-primary/20 text-primary text-xs">
                        {account.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{account.organization}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SOS History Section */}
      <div className="glass-card rounded-2xl p-6 border-red-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-foreground">SOS Alert History</h2>
            <span className="text-sm text-muted-foreground">({sosHistory.length})</span>
          </div>
          <button
            onClick={fetchSosHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/20 text-red-500 hover:bg-red-500/30 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {sosHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No SOS alerts sent yet</p>
        ) : (
          <div className="space-y-3">
            {sosHistory.map((sos, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex px-2 py-1 rounded-md bg-red-500 text-white text-xs font-bold">
                        EMERGENCY
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sos.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{sos.subject}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {sos.recipients?.map((email: string, i: number) => (
                        <span key={i} className="inline-flex px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-mono">
                          {email}
                        </span>
                      ))}
                    </div>
                    {sos.metadata?.sensorData && (
                      <div className="text-xs text-muted-foreground mt-2 font-mono">
                        Sensor Data: Water {sos.metadata.sensorData.waterLevel?.toFixed(1)}% | 
                        Seismic {sos.metadata.sensorData.seismic?.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    ID: {sos.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
