import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Message {
  content: string;
  type: 'human' | 'ai';
}

interface Conversation {
  session_id: string;
  title: string;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        payload => {
          if (payload.new && payload.new.session_id === sessionId) {
            const newMessage = payload.new.message as Message;
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('session_id, message')
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error fetching conversations",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const conversationMap = new Map<string, string>();
    data.forEach(row => {
      if (!conversationMap.has(row.session_id) && row.message.type === 'human') {
        conversationMap.set(row.session_id, row.message.content.slice(0, 100));
      }
    });

    const conversationList = Array.from(conversationMap).map(([session_id, content]) => ({
      session_id,
      title: content,
    }));

    setConversations(conversationList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const currentMessage = message;
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage, // Changed from query to message
          user_id: 'NA',
          request_id: uuidv4(),
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Request failed');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (session_id: string) => {
    setSessionId(session_id);
    fetchMessages(session_id);
  };

  const fetchMessages = async (session_id: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('message')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMessages(data.map(row => row.message));
  };

  return (
    <div className="flex h-screen bg-chat-background">
      <Sidebar
        conversations={conversations}
        onSelect={selectConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === 'human' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.type === 'human'
                    ? 'bg-chat-accent text-white'
                    : 'bg-chat-secondary text-chat-text'
                }`}
              >
                {msg.type === 'ai' ? (
                  <ReactMarkdown className="prose prose-invert">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-chat-secondary text-chat-text p-4 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-chat-border">
          <div className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-chat-secondary text-chat-text border-chat-border"
              disabled={loading}
            />
            <Button
              type="submit"
              className="bg-chat-accent hover:bg-chat-accent/90"
              disabled={loading}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;