import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDocuments, uploadDocument, deleteDocument } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
    const [documents, setDocuments] = useState([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const { user, logoutUser } = useAuth()
    const navigate = useNavigate()

    useEffect(() => { fetchDocuments() }, [])

    const fetchDocuments = async () => {
        try {
            const res = await getAllDocuments()
            setDocuments(res.data)
        } catch (err) {
            setError('Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (file) => {
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)
        setUploading(true)
        setError('')
        try {
            await uploadDocument(formData)
            await fetchDocuments()
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleFileInput = (e) => handleUpload(e.target.files[0])

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleUpload(e.dataTransfer.files[0])
    }

    const handleDelete = async (id) => {
        try {
            await deleteDocument(id)
            setDocuments(documents.filter(doc => doc.id !== id))
        } catch {
            setError('Failed to delete document')
        }
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDate = (dt) => {
        if (!dt) return ''
        return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const getFileIcon = (type) => {
        if (type === 'pdf') return '📄'
        if (type === 'docx') return '📝'
        return '📃'
    }

    const totalDocs = documents.length
    const processedDocs = documents.filter(d => d.isProcessed).length
    const totalSize = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0)

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #0a0a0f; }
                ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
                .nav-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
                .doc-card { transition: all 0.2s ease; cursor: pointer; }
                .doc-card:hover { transform: translateY(-2px); border-color: #3a3a5c !important; }
                .btn-primary { transition: all 0.2s ease; }
                .btn-primary:hover { background: #4f46e5 !important; transform: translateY(-1px); }
                .btn-danger:hover { background: rgba(239,68,68,0.15) !important; color: #f87171 !important; }
                .stat-card { transition: all 0.2s ease; }
                .stat-card:hover { border-color: #3a3a5c !important; }
                .logout-btn:hover { color: #e8e8f0 !important; }
                .upload-zone { transition: all 0.3s ease; }
                .upload-zone.drag { border-color: #6366f1 !important; background: rgba(99,102,241,0.05) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.4s ease forwards; }
                .spinner { animation: spin 0.8s linear infinite; }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                .pulse { animation: pulse 1.5s ease infinite; }
            `}</style>

            {/* Navbar */}
            <nav className="nav-blur" style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(10,10,15,0.85)',
                borderBottom: '1px solid #1a1a2e',
                padding: '0 2rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px'
                    }}>⚡</div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                        DocuBot <span style={{ color: '#6366f1' }}>Pro</span>
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 600, color: '#fff'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: '14px', color: '#9090b0', fontWeight: 400 }}>{user?.name}</span>
                    </div>
                    <button className="logout-btn" onClick={() => { logoutUser(); navigate('/login') }} style={{
                        background: 'none', border: '1px solid #2a2a3a', borderRadius: '8px',
                        padding: '6px 14px', fontSize: '13px', color: '#6060a0',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        Sign out
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

                {/* Page header */}
                <div className="fade-in" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                        My Documents
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6060a0' }}>Upload files and chat with them using AI</p>
                </div>

                {/* Stats Row */}
                <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Files', value: totalDocs, icon: '🗂️', color: '#6366f1' },
                        { label: 'Ready to Chat', value: processedDocs, icon: '✅', color: '#10b981' },
                        { label: 'Storage Used', value: formatSize(totalSize), icon: '💾', color: '#f59e0b' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{
                            background: '#111118', border: '1px solid #1e1e2e',
                            borderRadius: '14px', padding: '1.25rem 1.5rem',
                            display: 'flex', alignItems: 'center', gap: '14px'
                        }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '10px',
                                background: stat.color + '18',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', flexShrink: 0
                            }}>{stat.icon}</div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#6060a0', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                                <p style={{ fontSize: '22px', fontWeight: 600, color: '#fff', fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem',
                        fontSize: '14px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Upload Zone */}
                <div className="fade-in" style={{ marginBottom: '2rem' }}>
                    <div
                        className={`upload-zone ${dragOver ? 'drag' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        style={{
                            border: '1.5px dashed #2a2a3a', borderRadius: '16px',
                            padding: '2rem', textAlign: 'center',
                            background: '#0d0d14'
                        }}
                    >
                        {uploading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div className="spinner" style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    border: '3px solid #1e1e2e', borderTop: '3px solid #6366f1'
                                }} />
                                <p style={{ fontSize: '14px', color: '#6060a0' }}>Processing your document...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '12px',
                                    background: '#6366f115', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '24px'
                                }}>📂</div>
                                <div>
                                    <p style={{ fontSize: '15px', color: '#c0c0d8', fontWeight: 500, marginBottom: '4px' }}>
                                        Drop your file here or{' '}
                                        <label style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                                            browse
                                            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileInput} style={{ display: 'none' }} />
                                        </label>
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#4a4a6a' }}>Supports PDF, DOCX, TXT — max 10MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#9090b0' }}>
                        {totalDocs > 0 ? `${totalDocs} document${totalDocs > 1 ? 's' : ''}` : 'No documents yet'}
                    </h3>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="pulse" style={{
                                background: '#111118', border: '1px solid #1e1e2e',
                                borderRadius: '14px', height: '140px'
                            }} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && documents.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '4rem 2rem',
                        background: '#111118', border: '1px dashed #1e1e2e',
                        borderRadius: '16px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                        <p style={{ fontSize: '16px', color: '#6060a0', marginBottom: '8px' }}>No documents uploaded yet</p>
                        <p style={{ fontSize: '13px', color: '#3a3a5a' }}>Upload a PDF, DOCX, or TXT to start chatting</p>
                    </div>
                )}

                {/* Documents Grid */}
                {!loading && documents.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {documents.map((doc, i) => (
                            <div key={doc.id} className="doc-card fade-in" style={{
                                background: '#111118', border: '1px solid #1e1e2e',
                                borderRadius: '14px', padding: '1.25rem',
                                animationDelay: `${i * 0.05}s`, opacity: 0
                            }}>
                                {/* File header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: '#1a1a2a', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '20px', flexShrink: 0
                                        }}>
                                            {getFileIcon(doc.fileType)}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{
                                                fontSize: '14px', fontWeight: 500, color: '#e8e8f0',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                maxWidth: '160px'
                                            }}>{doc.fileName}</p>
                                            <p style={{ fontSize: '12px', color: '#4a4a6a', marginTop: '2px' }}>
                                                {formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px',
                                        background: doc.isProcessed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                        color: doc.isProcessed ? '#10b981' : '#f59e0b',
                                        border: `1px solid ${doc.isProcessed ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                        whiteSpace: 'nowrap', flexShrink: 0
                                    }}>
                                        {doc.isProcessed ? '● Ready' : '◌ Processing'}
                                    </span>
                                </div>

                                {/* File type badge */}
                                <div style={{ marginBottom: '14px' }}>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                                        background: '#6366f115', color: '#6366f1',
                                        border: '1px solid #6366f125', textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>
                                        {doc.fileType}
                                    </span>
                                    {doc.chunkCount && (
                                        <span style={{ fontSize: '12px', color: '#4a4a6a', marginLeft: '8px' }}>
                                            {doc.chunkCount} chunks
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(`/chat/${doc.id}`)}
                                        disabled={!doc.isProcessed}
                                        style={{
                                            flex: 1, background: doc.isProcessed ? '#6366f1' : '#1e1e2e',
                                            border: 'none', borderRadius: '8px', padding: '8px',
                                            fontSize: '13px', fontWeight: 500, color: doc.isProcessed ? '#fff' : '#3a3a5a',
                                            cursor: doc.isProcessed ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        💬 Chat
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDelete(doc.id)}
                                        style={{
                                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                            borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
                                            color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}