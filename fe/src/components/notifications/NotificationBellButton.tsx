import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationBellButtonProps {
  unreadCount: number
  onClick: () => void
  className?: string
}

export function NotificationBellButton({
  unreadCount,
  onClick,
  className,
}: NotificationBellButtonProps) {
  return (
    <Button variant="ghost" size="icon" className={cn('relative', className)} onClick={onClick}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
}
