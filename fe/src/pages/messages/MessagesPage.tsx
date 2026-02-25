import { useState } from 'react';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';

export default function MessagesPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* 
                Mobile: Show ConversationList if no chat is selected, otherwise hide.
                Desktop: Always show ConversationList (w-80 or w-96).
            */}
            <div className={`
                ${selectedConversationId ? 'hidden md:flex' : 'flex'} 
                w-full md:w-80 lg:w-96 flex-col border-r bg-muted/20
            `}>
                <ConversationList
                    selectedId={selectedConversationId}
                    onSelect={setSelectedConversationId}
                />
            </div>

            {/* 
                Mobile: Show ChatWindow ONLY if a chat is selected.
                Desktop: Always show (will display empty state if none selected).
            */}
            <div className={`
                ${selectedConversationId ? 'flex' : 'hidden md:flex'} 
                flex-1 flex-col bg-background relative
            `}>
                <ChatWindow
                    key={selectedConversationId || 'empty'}
                    conversationId={selectedConversationId}
                    onBack={() => setSelectedConversationId(null)}
                />
            </div>
        </div>
    );
}
