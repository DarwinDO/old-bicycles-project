import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FAKE_CONVERSATIONS } from './mockData';

interface ConversationListProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
    return (
        <div className="flex h-full flex-col">
            {/* Header & Search */}
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-4">Tin nhắn</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {FAKE_CONVERSATIONS.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => onSelect(chat.id)}
                            className={cn(
                                "flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/80",
                                selectedId === chat.id ? "bg-muted" : "bg-transparent"
                            )}
                        >
                            <div className="relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={chat.partnerAvatar} alt={chat.partnerName} />
                                    <AvatarFallback>{chat.partnerName[0]}</AvatarFallback>
                                </Avatar>
                                {chat.isOnline && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                )}
                            </div>

                            <div className="flex flex-1 flex-col overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold truncate">{chat.partnerName}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                        {chat.lastMessageTime}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-sm truncate mt-0.5",
                                    chat.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                )}>
                                    {chat.lastMessage}
                                </span>
                                <span className="text-xs text-primary truncate mt-1">
                                    🚲 {chat.bikeTitle}
                                </span>
                            </div>

                            {chat.unreadCount > 0 && (
                                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                    {chat.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
