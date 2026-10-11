import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, Copy, Check, User, Calendar, Heart, Trash2 } from 'lucide-react';

export default function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [script, setScript] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getScript(id)
        .then(setScript)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleCopy = () => {
    if (script?.code) {
      navigator.clipboard.writeText(script.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (!id) return;
    try {
      const res = await api.likeScript(id);
      setScript((prev: any) => ({ ...prev, likes: res?.likes ?? (prev.likes || 0) + 1 }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    if (!script?.code || !id) return;
    try {
      const res = await api.downloadScript(id);
      setScript((prev: any) => ({ ...prev, downloads: res?.downloads ?? (prev.downloads || 0) + 1 }));
    } catch (e) {
      console.error(e);
    }
    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(script.name || 'script').replace(/[^A-Za-z0-9_-]/g, '_')}.lua`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this script from the marketplace?')) return;
    try {
      await api.deleteScript(id);
      navigate('/marketplace');
    } catch (err: any) {
      alert(err.message || 'Failed to delete script');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!script) return <div className="text-center py-12">Script not found.</div>;

  const canDelete = user && (user.admin || user.uid === script.author_uid);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/marketplace" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Link>

      <div className="glass-card overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{script.name}</h1>
                {script.productId && (
                  <span className="px-2.5 py-0.5 bg-brand-500/20 text-brand-400 rounded font-mono text-xs border border-brand-500/30">
                    {script.productId}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-lg mb-4">{script.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {script.authorName}</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(script.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center"><Download className="w-4 h-4 mr-1" /> {script.downloads || 0} downloads</span>
                <span className="flex items-center text-pink-400"><Heart className="w-4 h-4 mr-1" /> {script.likes || 0} likes</span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <button onClick={handleLike} className="bg-navy-800 hover:bg-navy-700 text-pink-400 px-4 py-2 rounded-lg flex items-center transition-colors border border-navy-700">
                <Heart className="w-4 h-4 mr-2" />
                Like ({script.likes || 0})
              </button>
              <button onClick={handleCopy} className="bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors border border-navy-700">
                {copied ? <Check className="w-5 h-5 mr-2 text-green-500" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button onClick={handleDownload} className="glow-btn flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Download .lua
              </button>
              {canDelete && (
                <button onClick={handleDelete} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg border border-red-500/30 flex items-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-navy-950 rounded-xl border border-navy-800 overflow-hidden">
            <div className="bg-navy-900 px-4 py-2 border-b border-navy-800 flex items-center justify-between">
              <span className="text-sm text-gray-400 font-mono">source.lua</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
              <code>{script.code || '-- No code available'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
