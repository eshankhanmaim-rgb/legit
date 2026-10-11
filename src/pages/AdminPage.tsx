import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, Key, Shield, Activity, Plus, Trash2, Ban, RefreshCw, Package } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'generator' | 'licenses' | 'users' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      api.getStats().then(setStats).catch(console.error);
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="w-8 h-8 mr-3 text-brand-500" />
          Admin Control Panel
        </h1>
      </div>

      <div className="flex flex-wrap gap-1 mb-8 bg-navy-900/50 p-1 rounded-xl border border-navy-800 inline-flex">
        {(['overview', 'products', 'generator', 'licenses', 'users', 'audit'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-navy-800 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-navy-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-card min-h-[500px]">
        {activeTab === 'overview' && stats && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-brand-400" />} />
              <StatCard title="Active Subs" value={stats.activeSubscriptions} icon={<Activity className="w-6 h-6 text-green-400" />} />
              <StatCard title="Unused Licenses" value={stats.unusedLicenses} icon={<Key className="w-6 h-6 text-purple-400" />} />
              <StatCard title="Banned Licenses" value={stats.bannedUsers} icon={<Ban className="w-6 h-6 text-red-400" />} />
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'generator' && <GeneratorTab />}
        {activeTab === 'licenses' && <LicensesTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'audit' && <AuditTab />}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-navy-950/50 p-6 rounded-xl border border-navy-800 flex items-center space-x-4">
      <div className="p-3 bg-navy-900 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    api.listProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createProduct({
        product_id: productId.trim(),
        name: productName.trim(),
        description: description.trim() || undefined,
      });
      setProductId('');
      setProductName('');
      setDescription('');
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pid: string) => {
    if (!confirm(`Delete product "${pid}"?`)) return;
    try {
      await api.deleteProduct(pid);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-brand-400" />
          Create Product
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Define a <code className="text-brand-400">product_id</code> that you set in your C++ Loader via <code className="text-brand-400">Auth::SetProductId(...)</code>.
        </p>

        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product ID (used in Loader)</label>
            <input
              type="text"
              className="glass-input font-mono"
              placeholder="e.g. cs2_pro or val_lite"
              value={productId}
              onChange={e => setProductId(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product Name (shown on Dashboard)</label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Pruvate CS2 Pro"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Full kernel build for CS2"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="glow-btn w-full flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Create Product'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Configured Products ({products.length})</h3>
          <button onClick={fetchProducts} className="p-2 bg-navy-800 rounded hover:bg-navy-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="bg-navy-950/50 border border-navy-800 rounded-xl p-8 text-center text-gray-400">
            No custom products created yet. Create your first product on the left so you can generate product-specific licenses.
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.product_id || p.id} className="bg-navy-950/50 border border-navy-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-white text-lg">{p.name}</span>
                    <span className="px-2.5 py-0.5 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-md font-mono text-xs">
                      {p.product_id || p.id}
                    </span>
                  </div>
                  {p.description && <p className="text-sm text-gray-400 mt-1">{p.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(p.product_id || p.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GeneratorTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('default');
  const [amount, setAmount] = useState(1);
  const [duration, setDuration] = useState(30);
  const [prefix, setPrefix] = useState('PRV');
  const [discordId, setDiscordId] = useState('');
  const [generated, setGenerated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listProducts().then(list => {
      setProducts(list);
      if (list.length > 0) {
        setSelectedProductId(list[0].product_id || list[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const matched = products.find(p => (p.product_id || p.id) === selectedProductId);
      const res = await api.generateLicenses({
        count: amount,
        durationDays: duration,
        prefix,
        productId: selectedProductId,
        productName: matched ? matched.name : selectedProductId === 'global' ? 'All Products (Global)' : 'Default Product',
        note: discordId ? `Discord ID: ${discordId}` : undefined,
      });
      setGenerated(res as any);
    } catch (err) {
      console.error(err);
      alert('Failed to generate licenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-bold mb-6">Generate Licenses</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Product</label>
            <select
              className="glass-input"
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
            >
              {products.map(p => (
                <option key={p.product_id || p.id} value={p.product_id || p.id}>
                  {p.name} ({p.product_id || p.id})
                </option>
              ))}
              <option value="default">Default Product (default)</option>
              <option value="global">All Products / Global Pass (global)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input type="number" min="1" max="100" className="glass-input" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Duration (Days)</label>
              <select className="glass-input" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={36500}>Lifetime</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prefix (Optional)</label>
            <input type="text" className="glass-input" maxLength={12} value={prefix} onChange={e => setPrefix(e.target.value.toUpperCase())} placeholder="e.g. PRV" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Discord ID / Note (Optional)</label>
            <input type="text" className="glass-input" value={discordId} onChange={e => setDiscordId(e.target.value)} placeholder="For tracking reseller sales" />
          </div>
          <button type="submit" disabled={loading} className="glow-btn w-full mt-4">
            {loading ? 'Generating...' : 'Generate Keys'}
          </button>
        </form>
      </div>

      <div className="bg-navy-950/50 rounded-xl border border-navy-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Output ({generated.length})</h3>
          {generated.length > 0 && (
            <button onClick={() => navigator.clipboard.writeText(generated.join('\n'))} className="text-brand-400 text-sm hover:text-brand-300">Copy All</button>
          )}
        </div>
        <textarea
          readOnly
          className="w-full h-[300px] bg-navy-900 border border-navy-800 rounded-lg p-3 font-mono text-sm text-gray-300 focus:outline-none"
          value={generated.join('\n')}
          placeholder="Generated keys will appear here..."
        />
      </div>
    </div>
  );
}

function LicensesTab() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = () => {
    setLoading(true);
    api.listLicenses().then(setLicenses).catch(console.error).finally(() => setLoading(false));
  };

  const banLicense = async (key: string) => {
    if (confirm('Are you sure you want to ban this key?')) {
      await api.banLicense(key);
      fetchLicenses();
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">License Manager</h2>
        <button onClick={fetchLicenses} className="p-2 bg-navy-800 rounded hover:bg-navy-700"><RefreshCw className="w-4 h-4" /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-navy-800 text-gray-400 text-sm">
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Used By</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map(lic => (
              <tr key={lic.id} className="border-b border-navy-800/50 hover:bg-navy-800/20">
                <td className="py-3 px-4 font-mono text-sm">{lic.key}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-brand-500/15 text-brand-400 border border-brand-500/30 rounded text-xs font-medium">
                    {lic.productName} ({lic.productId})
                  </span>
                </td>
                <td className="py-3 px-4">{lic.durationDays === 'Lifetime' ? 'Lifetime' : `${lic.durationDays}d`}</td>
                <td className="py-3 px-4">
                  {lic.status === 'UNUSED' && <span className="text-green-400">Unused</span>}
                  {lic.status === 'USED' && <span className="text-gray-400">Used</span>}
                  {lic.status === 'BANNED' && <span className="text-red-400">Banned</span>}
                </td>
                <td className="py-3 px-4">{lic.usedBy || '-'}</td>
                <td className="py-3 px-4 flex space-x-2">
                  {lic.status !== 'BANNED' && (
                    <button onClick={() => banLicense(lic.id)} className="text-red-400 hover:text-red-300 p-1"><Ban className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.listUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  };

  const handleAction = async (action: string, id: string, currentlyBanned?: boolean) => {
    try {
      if (action === 'ban') {
        if (currentlyBanned) {
          if (confirm('Unban this user?')) await api.unbanUser(id);
        } else {
          if (confirm('Ban this user?')) await api.banUser(id);
        }
      } else if (action === 'hwid') {
        if (confirm('Reset HWID?')) await api.adminResetHwid(id);
      }
      fetchUsers();
    } catch (e) {
      alert('Action failed');
    }
  };

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">User Manager</h2>
        <div className="flex space-x-4">
          <input type="text" placeholder="Search users..." className="glass-input py-1" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={fetchUsers} className="p-2 bg-navy-800 rounded hover:bg-navy-700"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-navy-800 text-gray-400 text-sm">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Sub Active</th>
              <th className="py-3 px-4">HWID</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-navy-800/50 hover:bg-navy-800/20">
                <td className="py-3 px-4 font-medium">{u.username} {u.admin && <span className="text-brand-400 text-xs ml-1">(Admin)</span>}</td>
                <td className="py-3 px-4">{u.banned ? <span className="text-red-400">Banned</span> : <span className="text-green-400">Active</span>}</td>
                <td className="py-3 px-4">{u.hasActiveSub ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4 font-mono text-xs max-w-[150px] truncate">{u.hwid || 'None'}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <button onClick={() => handleAction('hwid', u.id)} title="Reset HWID" className="text-yellow-400 hover:text-yellow-300 p-1"><RefreshCw className="w-4 h-4" /></button>
                  {!u.admin && (
                    <button onClick={() => handleAction('ban', u.id, u.banned)} title={u.banned ? 'Unban' : 'Ban'} className="text-red-400 hover:text-red-300 p-1"><Ban className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listAuditLogs().then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading audit logs...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Security Audit Log</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-navy-800 text-gray-400 text-sm">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.log_id || i} className="border-b border-navy-800/50 text-sm">
                <td className="py-3 px-4 text-gray-400">{log.at ? new Date(log.at).toLocaleString() : '-'}</td>
                <td className="py-3 px-4 font-mono text-brand-400">{log.action}</td>
                <td className="py-3 px-4">{log.actor}</td>
                <td className="py-3 px-4 font-mono text-xs">{log.target || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-400">{log.ip || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No audit entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
