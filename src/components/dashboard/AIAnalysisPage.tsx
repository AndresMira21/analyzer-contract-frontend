import type { JSX } from 'react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menu, Plus, Trash2, MessageSquare } from 'lucide-react';

type ChatMessage = {
  id: string;
  author: 'user' | 'ai';
  text: string;
  date: string;
  type: 'question' | 'answer';
  pinned?: boolean;
};

type ChatSummary = {
  id: string;
  title: string;
  date: string;
  contractId?: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatError, setChatError] = useState<string | undefined>(undefined);
  // Eliminado input de título: el título del chat se auto-genera con la primera pregunta
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('');
  const [currentChatContractId, setCurrentChatContractId] = useState<string | null>(null);
  const [chatsApiAvailable, setChatsApiAvailable] = useState(true);

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
    const s = state as any;
    if (s?.conversationId && typeof s.conversationId === 'string') {
      setCurrentChatId(s.conversationId);
      if (s.contractName) setCurrentChatTitle(String(s.contractName));
    }
    if (s?.contractId && typeof s.contractId === 'string') {
      setCurrentChatContractId(String(s.contractId));
    }
  }, [state]);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    setLoadingChats(true);
    setChatError(undefined);
    (async () => {
      let finished = false;
      try {
        const chatsUrl = `${backendUrl}/api/chats`;
        const res = await fetch(chatsUrl, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (res.ok) {
          const list = await res.json();
          const arr = Array.isArray(list) ? list.map((c: any) => ({ id: String(c.id || c._id || ''), title: String(c.title || ''), date: String(c.date || c.createdAt || new Date().toISOString().slice(0, 10)), contractId: String(c.contractId || '') })).filter((x: ChatSummary) => x.id && x.title) : [];
          setChats(arr);
          if (arr.length > 0 && !currentChatId) {
            setCurrentChatId(arr[0].id);
            setCurrentChatTitle(arr[0].title);
            setCurrentChatContractId(arr[0].contractId || null);
          }
          setChatsApiAvailable(true);
          finished = true;
        }
      } catch {}
      if (!finished) {
        try {
          const histUrl = `${backendUrl}/api/chat/history`;
          const res2 = await fetch(histUrl, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
          if (res2.ok) {
            const list2 = await res2.json();
            const groups: Record<string, { title: string; date: string }> = {};
            if (Array.isArray(list2)) {
              for (const m of list2) {
                const cid = String(m.contractId || '');
                const key = cid || 'general';
                if (!groups[key]) {
                  groups[key] = { title: cid ? `Contrato ${cid}` : 'Chat general', date: String(m.timestamp || new Date().toISOString()) };
                }
              }
            }
            const arr = Object.entries(groups).map(([id, v]) => ({ id, title: v.title, date: v.date, contractId: id !== 'general' ? id : '' } as ChatSummary));
            setChats(arr);
            if (arr.length > 0 && !currentChatId) {
              setCurrentChatId(arr[0].id);
              setCurrentChatTitle(arr[0].title);
              setCurrentChatContractId(arr[0].contractId || null);
            }
            setChatsApiAvailable(false);
            finished = true;
          }
        } catch {}
      }
      if (!finished) {
        setChatError('No se pudo conectar con el servidor');
        setChats([]);
        setChatsApiAvailable(false);
      }
      setLoadingChats(false);
    })();
  }, [backendUrl, state.contractId, currentChatId]);

  const createChat = async (): Promise<void> => {
    // Crear conversación inmediata con título temporal
    setChatError(undefined);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
      const url = `${backendUrl}/api/chats`;
      const placeholder = state.contractId ? (state.contractName ? state.contractName : 'Chat de contrato') : 'Nuevo chat';
      const body = { title: placeholder, date: new Date().toISOString(), contractId: state.contractId ?? undefined };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include', body: JSON.stringify(body) });
      if (!res.ok) { return; }
      const created = await res.json();
      const item: ChatSummary = { id: String(created.id || created._id || `${Date.now()}`), title: String(created.title || placeholder), date: String(created.date || created.createdAt || new Date().toISOString()), contractId: state.contractId ? String(state.contractId) : '' };
      setChats((prev) => [item, ...prev]);
      setCurrentChatId(item.id);
      setCurrentChatTitle(item.title);
      setCurrentChatContractId(item.contractId || null);
      setMessages([]);
    } catch {}
  };

  const deleteChat = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    const url = `${backendUrl}/api/chats/${encodeURIComponent(id)}`;
    setChatError(undefined);
    try {
      const res = await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined, credentials: 'include' });
      if (!res.ok) {
        let msg = `Error al eliminar chat (HTTP ${res.status})`;
        try { const j = await res.json(); msg = String(j?.message || j?.error || msg); } catch { try { msg = await res.text(); } catch {} }
        setChatError(msg);
        return;
      }
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (currentChatId === id) {
        const next = chats.filter((c) => c.id !== id);
        const first = next[0];
        setCurrentChatId(first ? first.id : null);
        setCurrentChatTitle(first ? first.title : '');
        setMessages([]);
      }
    } catch {
      setChatError('No se pudo eliminar el chat');
    }
  };

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
  }, [state.contractId, state.contractName, backendUrl]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const makeTitle = (t: string): string => {
      const cleaned = t.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      return cleaned.slice(0, 80);
    };
    const newTitle = makeTitle(text);
    // Si no hay conversación seleccionada, crear una nueva usando la primera pregunta como título
    if (!currentChatId) {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
        const title = newTitle;
        const urlCreate = `${backendUrl}/api/chats`;
        const body = { title, date: new Date().toISOString(), contractId: state.contractId ?? undefined };
        const resCreate = await fetch(urlCreate, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include', body: JSON.stringify(body) });
        if (resCreate.ok) {
          const created = await resCreate.json();
          const convId = String(created.id || created._id || '');
          const item = { id: convId, title, date: String(created.date || created.createdAt || new Date().toISOString()), contractId: state.contractId ? String(state.contractId) : '' } as ChatSummary;
          setChats((prev) => [item, ...prev]);
          setCurrentChatId(convId);
          setCurrentChatTitle(title);
        }
      } catch {}
    }
    // Actualizar el título de la conversación con el texto de la pregunta
    if (currentChatId) {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
        const urlPatch = `${backendUrl}/api/chats/${encodeURIComponent(currentChatId)}`;
        const resPatch = await fetch(urlPatch, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include', body: JSON.stringify({ title: newTitle }) });
        if (resPatch.ok) {
          setCurrentChatTitle(newTitle);
          setChats((prev) => prev.map((c) => (c.id === currentChatId ? { ...c, title: newTitle } : c)));
        }
      } catch {}
    }
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, author: 'user', text: state.contractName ? `${text}\n\n[contexto: ${state.contractName} ${state.contractId ?? ''}]` : text, date: new Date().toISOString(), type: 'question' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    const payload = JSON.stringify({ text, contractId: state.contractId, contractName: state.contractName, conversationId: currentChatId ?? undefined });
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
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
      const url = state.contractId ? `${backendUrl}/api/chat/${state.contractId}` : `${backendUrl}/api/chat/general`;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message: text, conversationId: currentChatId ?? undefined }), credentials: 'include' });
      if (!res.ok) {
        let msgText = `Error del servidor (HTTP ${res.status})`;
        try { const j = await res.json(); msgText = String(j?.message || j?.error || msgText); } catch { try { msgText = await res.text(); } catch {} }
        const errMsg: ChatMessage = { id: `${Date.now()}-err`, author: 'ai', text: msgText, date: new Date().toISOString(), type: 'answer' };
        setMessages((prev) => [...prev, errMsg]);
        if (!atBottomRef.current) setNewAiCount((c) => c + 1);
      } else {
        const data = await res.json();
        const aiText = String(data.message || data.answer || '');
        const msg: ChatMessage = { id: `${Date.now()}-a`, author: 'ai', text: aiText, date: new Date().toISOString(), type: 'answer' };
        setMessages((prev) => [...prev, msg]);
        if (!atBottomRef.current) setNewAiCount((c) => c + 1);
      }
    } catch {}
    setTyping(false);
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    atBottomRef.current = true;
    setNewAiCount(0);
  }, [messages]);

  useEffect(() => {
    if (!currentChatId) return;
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    const url = `${backendUrl}/api/chat/history`;
    (async () => {
      try {
        const res = await fetch(url, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) return;
        const list = await res.json();
        let msgs = Array.isArray(list) ? list
          .filter((m: any) => m.conversationId === currentChatId)
          .map((m: any) => ({
            id: String(m.id || `${Date.now()}`),
            author: String(m.role) === 'user' ? 'user' : 'ai',
            text: String(m.message || ''),
            date: String(m.timestamp || new Date().toISOString()),
            type: String(m.role) === 'user' ? 'question' : 'answer',
          } as ChatMessage)) : [];
        // Sin fallbacks: los chats nuevos deben mostrarse vacíos si no hay mensajes de la conversación
        msgs.sort((a: ChatMessage, b: ChatMessage) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMessages(msgs);
      } catch {}
    })();
  }, [currentChatId, state.contractId, backendUrl]);

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
    <div className="min-h-[80vh] w-full px-4 md:px-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
      <div className="absolute inset-0 -z-10 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="w-full max-w-7xl mx-auto">
        <div className="sticky top-0 z-10 mb-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl px-5 py-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="md:hidden text-slate-200 border-slate-600 hover:bg-slate-700/60 h-10 w-10 rounded-xl flex items-center justify-center" onClick={() => setSidebarOpen(v => !v)}><Menu className="h-5 w-5" /></Button>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">{currentChatTitle || title}</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <MessageSquare className="h-5 w-5" />
            <span>Chat legal</span>
          </div>
        </div>
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <Card className={`${sidebarOpen ? 'block' : 'hidden'} md:block overflow-hidden border-slate-800`} style={{ backgroundColor: 'rgba(20,30,60,0.28)', boxShadow: '0 24px 56px rgba(58,123,255,0.08)', borderRadius: '20px' }}>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Button className="h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white" onClick={createChat}><Plus className="h-5 w-5" /></Button>
              </div>
              {loadingChats ? (
                <div className="text-slate-400 text-sm">Cargando chats…</div>
              ) : chatError ? (
                <div className="text-red-400 text-sm">{chatError}</div>
              ) : (
                <div className="space-y-2">
                  {chats.length === 0 ? (
                    <div className="text-slate-500 text-sm">Sin chats</div>
                  ) : (
                    chats.map((c) => (
                      <div key={c.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${currentChatId === c.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/40'}`} onClick={() => { setCurrentChatId(c.id); setCurrentChatTitle(c.title); setCurrentChatContractId(c.contractId || null); }}>
                        <div>
                          <div className="text-slate-200 text-sm">{c.title}</div>
                          <div className="text-slate-500 text-xs">{new Date(c.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                        </div>
                        <button className="h-8 w-8 rounded-md bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 text-white flex items-center justify-center" onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
          <Card className="overflow-hidden border-slate-800" style={{ backgroundColor: 'rgba(20,30,60,0.28)', boxShadow: '0 24px 56px rgba(58,123,255,0.08)', borderRadius: '20px' }}>
            <div className="flex flex-col">
              <div ref={listRef} onScroll={handleScroll} className="max-h-[60vh] overflow-y-auto px-6 md:px-7 py-6 space-y-5">
              {[...messages.filter(m => m.pinned === true), ...messages.filter(m => !m.pinned)].map((m) => {
                const isUser = m.author === 'user';
                const bubbleBase = 'max-w-[74%] rounded-2xl px-4 py-3 shadow-sm border leading-relaxed';
                const userBubble = 'bg-[#1e3a8a] text-white border-blue-700';
                const aiBubble = 'bg-slate-800/80 text-slate-100 border-slate-700';
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">{m.author === 'user' ? 'Usuario' : 'IA'} • {new Date(m.date).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</div>
                      {m.author === 'ai' ? (
                        <motion.div className={`${bubbleBase} ${aiBubble}`} initial={{ opacity: 0.85, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} dangerouslySetInnerHTML={{ __html: mdToHtml(m.text) }} />
                      ) : (
                        <div className={`${bubbleBase} ${userBubble}`}>{m.text}</div>
                      )}
                      <div className={isUser ? 'flex justify-end' : 'flex'}>
                        <Button variant="outline" className="text-slate-200 border-slate-600 hover:bg-slate-700/60 px-3 py-1 h-8 text-xs rounded-full" onClick={() => togglePin(m.id)}>{m.pinned ? 'Quitar fijado' : 'Fijar'}</Button>
                      </div>
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
                <div className="sticky bottom-2 flex justify-end pr-2">
                  <Button variant="outline" className="text-slate-200 border-slate-600 hover:bg-slate-700/60 rounded-full text-xs h-8 px-3" onClick={() => { if (listRef.current) { listRef.current.scrollTop = listRef.current.scrollHeight; } setNewAiCount(0); }}>Nuevo(s) {newAiCount}</Button>
                </div>
              )}
            </div>
            <div className="border-t border-slate-700/60 bg-slate-900/40 px-5 md:px-6 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <Input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} placeholder="Escribe tu consulta legal" className="flex-1 h-12 rounded-full border-slate-700 bg-slate-800/70 text-white placeholder:text-slate-500 shadow-sm" />
                <Button className="h-12 px-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white" onClick={() => send(input)}>Enviar</Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {suggestions.map((s) => (
                  <Button key={s} variant="outline" className="rounded-full px-3 py-1 h-8 text-xs text-slate-200 border-slate-600 hover:bg-slate-700/60" onClick={() => send(s)}>{s}</Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
