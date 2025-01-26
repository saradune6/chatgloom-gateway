import { ChevronLeft, ChevronRight, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  conversations: Array<{
    session_id: string;
    title: string;
  }>;
  onSelect: (session_id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ conversations, onSelect, isOpen, onToggle }: SidebarProps) => {
  return (
    <div
      className={`${
        isOpen ? 'w-80' : 'w-16'
      } bg-chat-secondary border-r border-chat-border transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between border-b border-chat-border">
        {isOpen && <h2 className="text-chat-text font-semibold">Conversations</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-chat-text hover:text-chat-accent"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isOpen && (
          <div className="p-2 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.session_id}
                onClick={() => onSelect(conv.session_id)}
                className="w-full p-3 text-left text-chat-text hover:bg-chat-background rounded-lg transition-colors flex items-center space-x-3"
              >
                <MessageSquare className="w-5 h-5 text-chat-muted" />
                <span className="truncate">{conv.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-chat-border">
        <Button
          variant="outline"
          className="w-full justify-center text-chat-text border-chat-border hover:bg-chat-background"
          onClick={() => onSelect(crypto.randomUUID())}
        >
          <Plus className="w-5 h-5" />
          {isOpen && <span className="ml-2">New Chat</span>}
        </Button>
      </div>
    </div>
  );
};