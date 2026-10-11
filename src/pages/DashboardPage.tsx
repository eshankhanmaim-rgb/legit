import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Clock, Key, Download, Cpu, AlertCircle, CheckCircle2, Package } from 'lucide-react';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loader, setLoader] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [hwidPassword, setHwidPassword] = useState('');
  const [showHwidModal, setShowHwidModal] = useState(false);
  const [hwidError, setHwidError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subData, loaderData] = await Promise.all([
        api.getSubscription().catch(() => null),
        api.getLatestLoader().catch(() => null)
      ]);
      setSubscription(subData);
      setLoader(loaderData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
    setLicenseKey(val);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemSuccess('');

    try {
      const res = await api.redeemKey({ key: licenseKey });
      const unlockedName = res?.product_name || 'Product';
      setRedeemSuccess(`Unlocked "${unlockedName}" (${res?.product_id || 'default'}) successfully!`);
      setLicenseKey('');
      fetchData();
      refreshUser();
    } catch (err: any) {
      setRedeemError(err.message || 'Failed to redeem key');
    }
  };

  const handleResetHwid = async (e: React.FormEvent) => {
    e.preventDefault();
    setHwidError('');
    try {
      await api.resetHwid({ username: user?.username || '', password: hwidPassword });
      setShowHwidModal(false);
      setHwidPassword('');
      refreshUser();
      alert('HWID Reset Successful');
    } catch (err: any) {
      setHwidError(err.message || 'Failed to reset HWID');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const isActive = Boolean(
    subscription &&
      subscription.active &&
      (subscription.lifetime || !subscription.expiresAt || new Date(subscription.expiresAt) > new Date())
  );
  const daysLeft = isActive
    ? subscription.lifetime
      ? 999
      : subscription.daysLeft ?? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
    : 0;

  const unlockedProducts: any[] = (subscription?.subscriptions || []).filter(
    (s: any) => s.active || s.status === 'active' || s.status === 'lifetime'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.username}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Subscription & Unlocked Products Card */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Clock className="w-5 h-5 mr-2 text-brand-400" />
                Subscription & Unlocked Products
              </h2>
              {isActive ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
                  {unlockedProducts.length} Active {unlockedProducts.length === 1 ? 'Product' : 'Products'}
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">Inactive</span>
              )}
            </div>

            {unlockedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedProducts.map((prod: any) => {
                  const pDays = prod.lifetime ? 999 : (prod.daysLeft ?? prod.days_left ?? daysLeft);
                  const pName = prod.productName || prod.product_name || 'Default Product';
                  const pId = prod.productId || prod.product_id || 'default';
                  const pExpires = prod.expiresAt || prod.expires_at;

                  return (
                    <div key={pId} className="bg-navy-950/70 border border-navy-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-brand-500/15 text-brand-400 rounded-lg border border-brand-500/30">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white">{pName}</h3>
                            <span className="px-2 py-0.5 bg-navy-800 text-brand-400 rounded font-mono text-xs border border-navy-700">
                              {pId}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {prod.lifetime
                              ? 'Lifetime License'
                              : pExpires
                                ? `Expires ${new Date(pExpires).toLocaleDateString()}`
                                : 'Active Subscription'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-brand-400 block leading-none">
                          {prod.lifetime ? '∞' : `${pDays}d`}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Left</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path strokeDasharray="100, 100" className="text-navy-800 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-bold block leading-none">0</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Days</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className="font-semibold text-lg">No active product licenses</p>
                  <p className="text-xs text-gray-500 mt-1">Redeem a product license key below to unlock loader access.</p>
                </div>
              </div>
            )}
          </div>

          {/* Key Activation */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold flex items-center mb-2">
              <Key className="w-5 h-5 mr-2 text-brand-400" />
              Redeem Product License Key
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Redeem keys for one or multiple products — each product license activates independently on your account.
            </p>

            <form onSubmit={handleRedeem} className="space-y-4">
              {redeemError && <div className="text-red-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{redeemError}</div>}
              {redeemSuccess && <div className="text-green-400 text-sm flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" />{redeemSuccess}</div>}

              <div className="flex space-x-4">
                <input
                  type="text"
                  className="glass-input flex-1 font-mono text-center tracking-widest uppercase"
                  placeholder="PRV-XXXXX-XXXXX-XXXXX-XXXXX"
                  value={licenseKey}
                  onChange={handleKeyFormat}
                  maxLength={40}
                />
                <button type="submit" className="glow-btn whitespace-nowrap" disabled={!licenseKey}>
                  Activate
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Hardware ID */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <Cpu className="w-5 h-5 mr-2 text-purple-400" />
              Hardware Lock
            </h2>

            <div className="bg-navy-950/50 rounded-lg p-4 mb-4 border border-navy-800 break-all font-mono text-sm text-gray-400">
              {user?.hwid || 'Not locked yet. Will bind on first loader login.'}
            </div>

            <button
              onClick={() => setShowHwidModal(true)}
              className="w-full bg-navy-800 hover:bg-navy-700 text-white font-medium py-2 px-4 rounded-lg border border-navy-700 transition-colors"
            >
              Request HWID Reset
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">Cooldown: 7 days between resets</p>
          </div>

          {/* Loader Download */}
          <div className="glass-card p-6 border-t-4 border-brand-500">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <Download className="w-5 h-5 mr-2 text-brand-400" />
              Loader
            </h2>

            {loader ? (
              <>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-400">Version</span>
                  <span className="font-mono bg-navy-800 px-2 py-1 rounded">{loader.version}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={loader.maintenance ? 'text-yellow-400' : 'text-green-400'}>
                    {loader.maintenance ? 'Maintenance' : 'Operational'}
                  </span>
                </div>
                <button
                  onClick={() => alert('Build loader from loader/main_example.cpp with Auth::SetProductId(...) configured!')}
                  className="glow-btn w-full flex items-center justify-center py-3"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Latest
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">No loader available currently.</p>
            )}
          </div>
        </div>
      </div>

      {/* HWID Modal */}
      {showHwidModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Confirm HWID Reset</h3>
            <p className="text-sm text-gray-400 mb-6">Enter your password to confirm HWID reset for user <strong className="text-white">{user?.username}</strong>. This action can only be performed once every 7 days.</p>

            <form onSubmit={handleResetHwid}>
              {hwidError && <div className="text-red-400 text-sm mb-4">{hwidError}</div>}
              <input
                type="password"
                className="glass-input mb-6"
                placeholder="Password"
                value={hwidPassword}
                onChange={e => setHwidPassword(e.target.value)}
                required
              />
              <div className="flex space-x-4">
                <button type="button" onClick={() => setShowHwidModal(false)} className="flex-1 bg-navy-800 hover:bg-navy-700 py-2 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 glow-btn">
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
