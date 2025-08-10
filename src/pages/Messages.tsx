import { Header } from '@/components/layout/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface PartnerProfile { id: string; display_name: string | null; avatar_url: string | null }

export const MessagesPage = () => {
  const { user } = useAuth();
  const { conversations, messages, sendMessage, markAsRead } = useDirectMessages();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, PartnerProfile>>({});
  const [text, setText] = useState('');
  const location = useLocation();
  const [allUsers, setAllUsers] = useState<PartnerProfile[]>([]);
  const [search, setSearch] = useState('');

  const currentThread = useMemo(
    () => messages.filter(m => m.sender_id === selectedPartnerId || m.receiver_id === selectedPartnerId),
    [messages, selectedPartnerId]
  );

  const loadPartnerProfiles = async () => {
    const partnerIds = Array.from(new Set(conversations.map(c => c.partnerId)));
    if (partnerIds.length === 0) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', partnerIds);
    const map: Record<string, PartnerProfile> = {};
    (data || []).forEach(p => { map[p.id] = p as PartnerProfile; });
    setPartnerProfiles(map);
  };

  useEffect(() => { loadPartnerProfiles(); }, [conversations.length]);

  // Cargar listado de usuarios para iniciar conversaciones nuevas
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .neq('id', user?.id || '');
      setAllUsers((data || []) as PartnerProfile[]);
    };
    loadUsers();
  }, [user?.id]);

  // Preselect from query param ?to=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const to = params.get('to');
    if (to) setSelectedPartnerId(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || !selectedPartnerId) return;
    currentThread
      .filter(m => m.receiver_id === user.id && !m.read_at)
      .forEach(m => { markAsRead(m.id); });
  }, [currentThread.length, selectedPartnerId]);

  const handleSend = async () => {
    if (!selectedPartnerId || !text.trim()) return;
    const ok = await sendMessage(selectedPartnerId, text.trim());
    if (ok) setText('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <aside className="md:col-span-1 border border-border rounded-lg overflow-hidden">
            <div className="p-3 border-b border-border font-medium">Conversaciones</div>
            <div className="max-h-[70vh] overflow-y-auto divide-y">
              {conversations.map(c => {
                const p = partnerProfiles[c.partnerId];
                const name = p?.display_name || c.partnerId.slice(0, 6);
                return (
                  <button key={c.partnerId} onClick={() => setSelectedPartnerId(c.partnerId)} className={`w-full text-left p-3 hover:bg-muted/40 ${selectedPartnerId === c.partnerId ? 'bg-muted' : ''}`}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {p?.avatar_url ? <AvatarImage src={p.avatar_url} /> : <AvatarFallback>{name.substring(0,2).toUpperCase()}</AvatarFallback>}
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{c.lastMessage?.content}</div>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No tienes conversaciones todavía.</div>
              )}
              <div className="p-3 border-t border-border">
                <div className="text-xs mb-2 text-muted-foreground">Iniciar nueva conversación</div>
                <Input
                  placeholder="Buscar usuario..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {allUsers
                    .filter(u => (u.display_name || '').toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 20)
                    .map(u => (
                      <button key={u.id} onClick={() => setSelectedPartnerId(u.id)} className="w-full text-left p-2 hover:bg-muted/40 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {u.avatar_url ? <AvatarImage src={u.avatar_url} /> : <AvatarFallback>{(u.display_name || 'US').substring(0,2).toUpperCase()}</AvatarFallback>}
                          </Avatar>
                          <span className="text-sm">{u.display_name || u.id.slice(0,6)}</span>
                        </div>
                      </button>
                    ))}
                  {allUsers.length === 0 && (
                    <div className="text-xs text-muted-foreground">No hay usuarios.</div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section className="md:col-span-2 border border-border rounded-lg flex flex-col max-h-[75vh]">
            <div className="p-3 border-b border-border font-medium">
              {selectedPartnerId ? (partnerProfiles[selectedPartnerId]?.display_name || selectedPartnerId.slice(0,6)) : 'Selecciona una conversación'}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedPartnerId ? (
                currentThread.map(m => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`max-w-[80%] ${mine ? 'ml-auto text-right' : ''}`}>
                      <div className={`inline-block rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {m.content}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString('es-CL')}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">Elige una conversación a la izquierda.</div>
              )}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input placeholder="Escribe un mensaje..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
              <Button onClick={handleSend} className="bg-gradient-button">Enviar</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;


