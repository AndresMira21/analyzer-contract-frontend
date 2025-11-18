import type { JSX } from 'react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type ChatMessage = {
  id: string;
  author: 'user' | 'ai';
  text: string;
  date: string;
  type: 'question' | 'answer';
  pinned?: boolean;
};

export default function AIAnalysisPage(): JSX.Element {
  const location = useLocation();
  const state = (location.state ?? {}) as { contractId?: string; contractName?: string };
  const title = state.contractName ? `Chat legal sobre: ${state.contractName}` : 'Análisis con IA';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const isMountedRef = useRef(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const pendingMsgRef = useRef<ChatMessage | null>(null);
  const atBottomRef = useRef(true);
  const [newAiCount, setNewAiCount] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Solicitar resumen del contrato',
    'Identificar riesgos potenciales',
    'Extraer cláusulas clave',
  ]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const escapeHtml = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const mdToHtml = (s: string) => {
    let t = escapeHtml(s);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/`([^`]+?)`/g, '<code>$1</code>');
    t = t.replace(/\[(.+?)\]\((https?:[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    const lines = t.split(/\r?\n/);
    const out: string[] = [];
    let inList = false;
    for (const line of lines) {
      if (/^\s*-\s+/.test(line)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + line.replace(/^\s*-\s+/, '') + '</li>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<p>' + line + '</p>');
      }
    }
    if (inList) out.push('</ul>');
    return out.join('');
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_CHAT_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_CHAT_WS as string | undefined) || '';
    let active = true;

    const handleData = (raw: any) => {
      if (!active || !isMountedRef.current) return;
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data.typing === true || data.event === 'typing') {
          setTyping(true);
          return;
        }
        if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.map((s: any) => String(s)).filter(Boolean));
        }
        if (typeof data.delta === 'string') {
          if (!pendingMsgRef.current) {
            const msg: ChatMessage = { id: `${Date.now()}-stream`, author: 'ai', text: '', date: new Date().toISOString(), type: 'answer' };
            pendingMsgRef.current = msg;
            setMessages((prev) => [...prev, msg]);
            if (!atBottomRef.current) setNewAiCount((c) => c + 1);
          }
          const add = String(data.delta);
          pendingMsgRef.current.text += add;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...pendingMsgRef.current! };
            return next;
          });
          return;
        }
        if (data.done === true) {
          setTyping(false);
          pendingMsgRef.current = null;
          return;
        }
        const text = data.text ?? data.answer ?? '';
        if (text) {
          const msg: ChatMessage = { id: `${Date.now()}`, author: 'ai', text: String(text), date: new Date().toISOString(), type: 'answer' };
          setMessages((prev) => [...prev, msg]);
          if (!atBottomRef.current) setNewAiCount((c) => c + 1);
          setTyping(false);
        }
      } catch {}
    };

    if (sseUrl) {
      try {
        esRef.current = new EventSource(sseUrl, { withCredentials: true });
        esRef.current.onmessage = (e) => handleData(e.data);
        esRef.current.onerror = () => { setTyping(false); };
      } catch {}
    } else if (wsUrl) {
      try {
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onmessage = (ev) => handleData(ev.data as string);
        wsRef.current.onerror = () => { setTyping(false); };
      } catch {}
    }
    return () => {
      active = false;
      if (esRef.current) try { esRef.current.close(); } catch {}
      if (wsRef.current) try { wsRef.current.close(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!state.contractId && !state.contractName) return;
    setTyping(true);
    const setCtxUrl = (process.env.REACT_APP_CHAT_SET_CONTEXT as string | undefined) || '';
    const envDetails = (process.env.REACT_APP_CONTRACT_DETAILS as string | undefined) || '';
    const detailsUrl = envDetails || (state.contractId ? `${backendUrl}/api/contracts/${state.contractId}` : '');
    const payload = { contractId: state.contractId, contractName: state.contractName };
    const sendWs = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ type: 'set_context', ...payload })); } catch {}
        return true;
      }
      return false;
    };
    const postCtx = async () => {
      if (!setCtxUrl) return false;
      try {
        await fetch(setCtxUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
        return true;
      } catch {
        return false;
      }
    };
    const fetchDetails = async () => {
      if (!detailsUrl) return null;
      try {
        const token = localStorage.getItem('authToken') || '';
        const url = envDetails && state.contractId ? (detailsUrl.includes(':id') ? detailsUrl.replace(':id', String(state.contractId)) : `${detailsUrl}?id=${encodeURIComponent(String(state.contractId))}`) : detailsUrl;
        const res = await fetch(url, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        return await res.json();
      } catch {
        return null;
      }
    };
    (async () => {
      const okWs = sendWs();
      const okPost = okWs ? true : await postCtx();
      if (okWs || okPost) {
        setTyping(false);
        const msg: ChatMessage = { id: `${Date.now()}-ctx`, author: 'ai', text: `Contexto de contrato cargado: ${state.contractName ?? ''}`.trim(), date: new Date().toISOString(), type: 'answer' };
        setMessages((prev) => [...prev, msg]);
        if (!atBottomRef.current) setNewAiCount((c) => c + 1);
        return;
      }
      const details = await fetchDetails();
      if (details && details.name) {
        const tx = `Contexto cargado: ${details.name}. Puedes preguntar sobre cláusulas, riesgos y recomendaciones.`;
        const msg: ChatMessage = { id: `${Date.now()}-ctx2`, author: 'ai', text: tx, date: new Date().toISOString(), type: 'answer' };
        setMessages((prev) => [...prev, msg]);
        if (!atBottomRef.current) setNewAiCount((c) => c + 1);
      }
      setTyping(false);
    })();
  }, [state.contractId, state.contractName]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, author: 'user', text: state.contractName ? `${text}\n\n[contexto: ${state.contractName} ${state.contractId ?? ''}]` : text, date: new Date().toISOString(), type: 'question' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    const payload = JSON.stringify({ text, contractId: state.contractId, contractName: state.contractName });
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try { wsRef.current.send(payload); } catch {}
      return;
    }
    if (esRef.current) {
      const sendUrl = (process.env.REACT_APP_CHAT_SEND as string | undefined) || '';
      if (sendUrl) {
        try {
          await fetch(sendUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, credentials: 'include' });
          return;
        } catch {}
      }
      // fall through to backend REST
    }
    try {
      const token = localStorage.getItem('authToken') || '';
      const url = state.contractId ? `${backendUrl}/api/chat/${state.contractId}` : `${backendUrl}/api/chat/general`;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      const aiText = String(data.message || '');
      const msg: ChatMessage = { id: `${Date.now()}-a`, author: 'ai', text: aiText, date: new Date().toISOString(), type: 'answer' };
      setMessages((prev) => [...prev, msg]);
      if (!atBottomRef.current) setNewAiCount((c) => c + 1);
    } catch {}
    setTyping(false);
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    atBottomRef.current = true;
    setNewAiCount(0);
  }, [messages]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    atBottomRef.current = atBottom;
    if (atBottom) setNewAiCount(0);
  };

  const togglePin = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
  };

  

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">{title}</h2>
      <Card className="p-6 backdrop-blur transition-all" style={{ backgroundColor: 'rgba(20,30,60,0.32)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }}>
        <div className="space-y-4">
          <div ref={listRef} onScroll={handleScroll} className="relative space-y-3 max-h-[52vh] overflow-y-auto pr-2">
            {[...messages.filter(m => m.pinned === true), ...messages.filter(m => !m.pinned)].map((m) => {
              const bubbleClass = m.author === 'user' ? 'bg-slate-800/60 text-slate-200' : 'bg-slate-900/60 text-slate-100';
              const aiStyle = m.author === 'ai' ? { boxShadow: '0 12px 28px rgba(58,123,255,0.10)', borderColor: 'rgba(58,123,255,0.22)' } : { borderColor: 'rgba(58,123,255,0.18)' };
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col">
                  <div className="text-sm text-slate-400">{m.author === 'user' ? 'Usuario' : 'IA'} • {new Date(m.date).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</div>
                  {m.author === 'ai' ? (
                    <motion.div className={`${bubbleClass} px-4 py-3 rounded-xl border`} style={aiStyle} initial={{ opacity: 0.6, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} dangerouslySetInnerHTML={{ __html: mdToHtml(m.text) }} />
                  ) : (
                    <div className={`${bubbleClass} px-4 py-3 rounded-xl border`} style={aiStyle}>{m.text}</div>
                  )}
                  <div className="mt-2">
                    <Button variant="outline" className="text-white" onClick={() => togglePin(m.id)}>{m.pinned ? 'Quitar fijado' : 'Fijar'}</Button>
                  </div>
                </motion.div>
              );
            })}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex items-center gap-2 text-slate-400 text-sm">
                <span>IA escribiendo</span>
                <div className="flex items-center gap-1">
                  <motion.span className="h-2 w-2 rounded-full bg-slate-500" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                  <motion.span className="h-2 w-2 rounded-full bg-slate-500" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
                  <motion.span className="h-2 w-2 rounded-full bg-slate-500" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
            {newAiCount > 0 && (
              <div className="absolute bottom-2 right-2">
                <Button variant="outline" className="text-white" onClick={() => { if (listRef.current) { listRef.current.scrollTop = listRef.current.scrollHeight; } setNewAiCount(0); }}>Nuevo(s) {newAiCount}</Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} placeholder="Escribe tu consulta legal" className="flex-1 border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 h-12" />
            <Button className="text-white" onClick={() => send(input)}>Enviar</Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {suggestions.map((s) => (
              <Button key={s} variant="outline" className="text-white" onClick={() => send(s)}>{s}</Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}