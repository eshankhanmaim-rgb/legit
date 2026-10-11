import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Search, Code2, Download, Heart, Plus, X } from 'lucide-react';

export default function MarketplacePage() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('combat, visuals');
  const [productId, setProductId] = useState('');
  const [code, setCode] = useState('-- Paste your Lua script here\nfunction on_paint()\n    print("Pruvate Lua Loaded")\nend');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchMarketplace = () => {
    setLoading(true);
    Promise.all([
      api.listScripts().catch(() => []),
      api.listProducts().catch(() => []),
    ])
      .then(([scriptList, productList]) => {
        setScripts(scriptList);
        setProducts(productList);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 5);
      await api.createScript({
        title,
        description,
        code,
        tags,
        product_id: productId || undefined,
      });
      setShowUpload(false);
      setTitle('');
      setDescription('');
      fetchMarketplace();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload script');
    } finally {
      setUploading(false);
    }
  };

  const filtered = scripts.filter(
    s =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lua Marketplace</h1>
          <p className="text-gray-400">Discover, upload, and share verified Lua scripts with the community.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search scripts or tags..."
              className="glass-input pl-10 w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowUpload(true)} className="glow-btn flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Upload Script
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading scripts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(script => (
            <Link key={script.id} to={`/marketplace/${script.id}`} className="glass-card overflow-hidden group hover:border-brand-500 transition-colors flex flex-col justify-between">
              <div>
                <div className="h-36 bg-navy-950 relative border-b border-navy-800">
                  <div className="w-full h-full flex items-center justify-center text-brand-500/30">
                    <Code2 className="w-14 h-14" />
                  </div>
                  <div className="absolute top-2 left-2">
                    {script.productId && (
                      <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded text-xs font-mono border border-brand-500/30">
                        {script.productId}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
                    {script.tags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-navy-900/80 backdrop-blur-md rounded text-xs font-medium border border-navy-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-brand-400 transition-colors">{script.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{script.description}</p>
                </div>
              </div>

              <div className="px-4 pb-4 flex items-center justify-between text-sm text-gray-500 border-t border-navy-800/50 pt-3">
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-pink-500" />
                  {script.likes || 0}
                </span>
                <span className="flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  {script.downloads || 0}
                </span>
                <span>By <span className="text-gray-300">{script.authorName}</span></span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full glass-card p-12 text-center text-gray-400">
              <Code2 className="w-12 h-12 mx-auto mb-3 text-navy-700" />
              <p className="text-lg font-medium text-white mb-1">No Lua scripts found</p>
              <p className="text-sm mb-4">Be the first to share a script with the community!</p>
              <button onClick={() => setShowUpload(true)} className="glow-btn inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Upload First Script
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Script Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload Lua Script</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Script Title</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Custom HUD & Radar"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    minLength={3}
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Product (Optional)</label>
                  <select className="glass-input" value={productId} onChange={e => setProductId(e.target.value)}>
                    <option value="">All Products</option>
                    {products.map(p => (
                      <option key={p.product_id || p.id} value={p.product_id || p.id}>
                        {p.name} ({p.product_id || p.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Describe what your script does..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={500}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="visuals, misc, rage"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Lua Source Code</label>
                <textarea
                  className="glass-input font-mono text-sm h-56"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="glow-btn">
                  {uploading ? 'Publishing...' : 'Publish Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
