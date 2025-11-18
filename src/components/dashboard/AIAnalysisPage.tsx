import type { JSX } from 'react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
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
  const [suggestions, setSuggestions] = useState<string[]>([
    'Solicitar resumen del contrato',
    'Identificar riesgos potenciales',
    'Extraer cláusulas clave',
  ]);

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
    const detailsUrl = (process.env.REACT_APP_CONTRACT_DETAILS as string | undefined) || '';
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
      if (!detailsUrl || !state.contractId) return null;
      try {
        const url = detailsUrl.includes(':id') ? detailsUrl.replace(':id', String(state.contractId)) : `${detailsUrl}?id=${encodeURIComponent(String(state.contractId))}`;
        const res = await fetch(url, { credentials: 'include' });
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
        return;
      }
      const details = await fetchDetails();
      if (details && details.name) {
        const tx = `Contexto cargado: ${details.name}. Puedes preguntar sobre cláusulas, riesgos y recomendaciones.`;
        const msg: ChatMessage = { id: `${Date.now()}-ctx2`, author: 'ai', text: tx, date: new Date().toISOString(), type: 'answer' };
        setMessages((prev) => [...prev, msg]);
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
      return;
    }
    window.setTimeout(() => {
      const aiText = state.contractName ? `Análisis del contrato ${state.contractName}: se recomienda revisar cláusulas de confidencialidad, penalidades y vigencia.` : 'Tu solicitud está siendo procesada. Proporciona el contrato para respuestas específicas.';
      const aiMsg: ChatMessage = { id: `${Date.now()}-a`, author: 'ai', text: aiText, date: new Date().toISOString(), type: 'answer' };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 900);
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">{title}</h2>
      <Card className="p-6 backdrop-blur transition-all" style={{ backgroundColor: 'rgba(20,30,60,0.32)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }}>
        <div className="space-y-4">
          <div ref={listRef} className="space-y-3 max-h-[52vh] overflow-y-auto pr-2">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col">
                <div className="text-sm text-slate-400">{m.author === 'user' ? 'Usuario' : 'IA'} • {new Date(m.date).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</div>
                <div className={`${m.author === 'user' ? 'bg-slate-800/60 text-slate-200' : 'bg-slate-900/60 text-slate-100'} px-4 py-3 rounded-xl border`} style={{ borderColor: 'rgba(58,123,255,0.18)' }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="text-slate-400 text-sm">IA escribiendo...</div>
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