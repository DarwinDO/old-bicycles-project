import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FAKE_CONVERSATIONS, getMessagesForChat, type Message } from './mockData';
import { useState, useRef, useEffect } from 'react';

interface ChatWindowProps {
    conversationId: string | null;
    onBack: () => void;
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>(() => {
        return conversationId ? getMessagesForChat(conversationId) : [];
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    const chat = FAKE_CONVERSATIONS.find(c => c.id === conversationId);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Optimistic UI update
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isMe: true,
            time: 'Vừa xong',
            status: 'sending'
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Simulate network delay to resolve message state
        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
            ));
        }, 600);
    };

    if (!conversationId || !chat) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquarePlus className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Chưa chọn cuộc trò chuyện</h3>
                <p className="max-w-sm">
                    Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu nhắn tin mới từ trang chi tiết xe đạp.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.partnerAvatar} alt={chat.partnerName} />
                        <AvatarFallback>{chat.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold leading-none">{chat.partnerName}</span>
                        <span className="text-xs text-green-500 mt-1">Đang hoạt động</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
            </header>

            {/* Product Snippet */}
            <div className="p-3 bg-muted/30 border-b flex items-center gap-3 shrink-0 cursor-pointer hover:bg-muted/50 transition-colors">
                <img src={chat.bikeImage} alt="xe" className="h-12 w-12 rounded object-cover" />
                <div className="flex-1 flex flex-col justify-center">
                    <span className="font-medium text-sm line-clamp-1">{chat.bikeTitle}</span>
                    <span className="text-primary font-bold text-sm">{chat.bikePrice}</span>
                </div>
                <Badge variant={chat.bikeStatus === 'Đã bán' ? 'secondary' : 'default'} className="shrink-0">
                    {chat.bikeStatus}
                </Badge>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-4">
                    <div className="flex justify-center my-4">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            Hôm nay
                        </span>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex max-w-[75%] md:max-w-[65%] flex-col gap-1">
                                <div className={`
                                    rounded-2xl px-4 py-2 text-sm
                                    ${msg.isMe
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted text-foreground rounded-bl-sm border'}
                                    ${msg.status === 'sending' ? 'opacity-70' : ''}
                                `}>
                                    {msg.text}
                                </div>
                                <div className={`flex text-[10px] text-muted-foreground ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    {msg.status === 'sending' ? 'Đang gửi...' : msg.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-background border-t mt-auto">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 max-w-3xl mx-auto"
                >
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Input
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="shrink-0 rounded-full h-10 w-10" disabled={!inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
