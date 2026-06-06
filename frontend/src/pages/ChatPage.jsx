import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { askQuestion, getChatHistory } from '../services/api'

export default function ChatPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchHistory()
    }, [documentId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchHistory = async () => {
        try {
            const res = await getChatHistory(documentId)
            const formatted = res.data.flatMap(msg => [
                { role: 'user', content: msg.question, time: msg.createdAt },
                { role: 'bot', content: msg.answer, time: msg.createdAt }
            ])
            setMessages(formatted)
        } catch (err) {
            console.error('Failed to load history')
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleSend = async () => {
        if (!question.trim() || loading) return

        const userMsg = { role: 'user', content: question, time: new Date().toISOString() }
        setMessages(prev => [...prev, userMsg])
        setQuestion('')
        setLoading(true)

        try {
            const res = await askQuestion({ documentId: parseInt(documentId), question: userMsg.content })
            const botMsg = { role: 'bot', content: res.data.answer, time: res.data.createdAt }
            setMessages(prev => [...prev, botMsg])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: 'Something went wrong. Please try again.',
                time: new Date().toISOString(),
                error: true
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const formatTime = (dt) => {
        if (!dt) return ''
        return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#e8e8f0' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #0a0a0f; }
                ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
                .msg { animation: fadeSlideIn 0.3s ease forwards; }
                .send-btn:hover { background: #4f46e5 !important; }
                .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .back-btn:hover { color: #e8e8f0 !important; }
                textarea:focus { outline: none; border-color: #6366f1 !important; }
                textarea { resize: none; }
            `}</style>

            {/* Header */}
            <div style={{
                background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid #1a1a2e',
                padding: '0 1.5rem', height: '60px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'blur(12px)', flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="back-btn" onClick={() => navigate('/dashboard')} style={{
                        background: 'none', border: 'none', color: '#6060a0',
                        cursor: 'pointer', fontSize: '20px', transition: 'color 0.2s',
                        display: 'flex', alignItems: 'center'
                    }}>←</button>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                    }}>⚡</div>
                    <div>
                        <p style={{ fontFamily: 'Syne', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                            DocuBot <span style={{ color: '#6366f1' }}>Pro</span>
                        </p>
                        <p style={{ fontSize: '11px', color: '#4a4a6a' }}>Document #{documentId}</p>
                    </div>
                </div>
                <div style={{
                    fontSize: '12px', color: '#10b981', padding: '4px 10px',
                    background: 'rgba(16,185,129,0.1)', borderRadius: '20px',
                    border: '1px solid rgba(16,185,129,0.2)'
                }}>
                    ● AI Ready
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

                {/* Loading history */}
                {historyLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e1e2e', flexShrink: 0, animation: 'pulse 1.5s ease infinite' }} />
                                <div style={{ flex: 1, height: '60px', borderRadius: '12px', background: '#111118', animation: 'pulse 1.5s ease infinite' }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!historyLoading && messages.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', paddingTop: '4rem' }}>
                        <div style={{ fontSize: '56px' }}>🤖</div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '18px', fontWeight: 600, color: '#c0c0d8', marginBottom: '8px', fontFamily: 'Syne' }}>Ask anything about your document</p>
                            <p style={{ fontSize: '14px', color: '#4a4a6a' }}>I've read through your document and I'm ready to help</p>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                            {['Summarize this document', 'What are the key points?', 'List the main topics'].map(hint => (
                                <button key={hint} onClick={() => setQuestion(hint)} style={{
                                    background: '#111118', border: '1px solid #2a2a3a', borderRadius: '20px',
                                    padding: '8px 14px', fontSize: '13px', color: '#8080a0', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>{hint}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message list */}
                {!historyLoading && messages.map((msg, i) => (
                    <div key={i} className="msg" style={{
                        display: 'flex', gap: '12px', marginBottom: '20px',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start'
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : '#1a1a2e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px'
                        }}>
                            {msg.role === 'user' ? '👤' : '🤖'}
                        </div>

                        {/* Bubble */}
                        <div style={{ maxWidth: '70%' }}>
                            <div style={{
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                    : msg.error ? 'rgba(239,68,68,0.1)' : '#111118',
                                border: msg.role === 'user' ? 'none' : `1px solid ${msg.error ? 'rgba(239,68,68,0.2)' : '#1e1e2e'}`,
                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                padding: '12px 16px',
                                fontSize: '14px', lineHeight: '1.6',
                                color: msg.role === 'user' ? '#fff' : msg.error ? '#f87171' : '#d0d0e8',
                                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                            }}>
                                {msg.content}
                            </div>
                            <p style={{
                                fontSize: '11px', color: '#3a3a5a', marginTop: '4px',
                                textAlign: msg.role === 'user' ? 'right' : 'left'
                            }}>
                                {formatTime(msg.time)}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="msg" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#1a1a2e', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '14px', flexShrink: 0
                        }}>🤖</div>
                        <div style={{
                            background: '#111118', border: '1px solid #1e1e2e',
                            borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
                            display: 'flex', gap: '5px', alignItems: 'center'
                        }}>
                            {[0, 0.15, 0.3].map((delay, i) => (
                                <div key={i} style={{
                                    width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1',
                                    animation: `pulse 1.2s ease ${delay}s infinite`
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                borderTop: '1px solid #1a1a2e', padding: '1rem 1.5rem',
                background: '#0a0a0f', flexShrink: 0
            }}>
                <div style={{
                    display: 'flex', gap: '10px', alignItems: 'flex-end',
                    background: '#111118', border: '1px solid #2a2a3a',
                    borderRadius: '14px', padding: '10px 10px 10px 16px'
                }}>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your document..."
                        rows={1}
                        style={{
                            flex: 1, background: 'none', border: 'none',
                            fontSize: '14px', color: '#e8e8f0', lineHeight: '1.5',
                            maxHeight: '120px', fontFamily: 'DM Sans, sans-serif',
                            outline: 'none', padding: 0
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto'
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                        }}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!question.trim() || loading}
                        style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: '#6366f1', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', flexShrink: 0, transition: 'all 0.2s'
                        }}
                    >
                        ➤
                    </button>
                </div>
                <p style={{ fontSize: '11px', color: '#3a3a5a', textAlign: 'center', marginTop: '8px' }}>
                    Press Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    )
}