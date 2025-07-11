import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Send, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Settings,
  MessageSquare,
  Users,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Calendar
} from "lucide-react"

const channels = [
  {
    id: 1,
    type: "telegram",
    name: "Tech News Channel",
    chatId: "@technews_channel",
    status: "active",
    subscribers: 15420,
    lastPost: "2024-12-07T10:30:00"
  },
  {
    id: 2,
    type: "vk",
    name: "Новости VK",
    chatId: "vk.com/news_group",
    status: "active", 
    subscribers: 8750,
    lastPost: "2024-12-07T09:15:00"
  },
  {
    id: 3,
    type: "whatsapp",
    name: "WhatsApp Broadcast",
    chatId: "+7XXXXXXXXXX",
    status: "inactive",
    subscribers: 234,
    lastPost: null
  }
]

const schedules = [
  {
    id: 1,
    channel: "telegram",
    channelName: "Tech News Channel",
    frequency: "daily",
    time: "09:00",
    newsCount: 3,
    useRewriting: true,
    isActive: true,
    lastRun: "2024-12-07T09:00:00"
  },
  {
    id: 2,
    channel: "vk",
    channelName: "Новости VK",
    frequency: "daily",
    time: "12:00",
    newsCount: 2,
    useRewriting: false,
    isActive: true,
    lastRun: "2024-12-07T12:00:00"
  },
  {
    id: 3,
    channel: "whatsapp",
    channelName: "WhatsApp Broadcast",
    frequency: "weekly",
    time: "18:00",
    newsCount: 5,
    useRewriting: true,
    isActive: false,
    lastRun: null
  }
]

export function Publications() {
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="text-success border-success/20 bg-success/10">
          <CheckCircle className="w-3 h-3 mr-1" />
          Активен
        </Badge>
      case "inactive":
        return <Badge variant="outline" className="text-muted-foreground border-muted/20 bg-muted/10">
          <XCircle className="w-3 h-3 mr-1" />
          Неактивен
        </Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "telegram":
        return <MessageSquare className="w-4 h-4 text-info" />
      case "vk":
        return <Users className="w-4 h-4 text-primary" />
      case "whatsapp":
        return <Phone className="w-4 h-4 text-success" />
      default:
        return <Send className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Никогда"
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit", 
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const ChannelForm = ({ channel, onSave, onCancel }: any) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Тип канала</Label>
        <Select defaultValue={channel?.type}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="vk">VK</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Название канала</Label>
        <Input 
          id="name" 
          placeholder="Например: Tech News Channel"
          defaultValue={channel?.name}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="chatId">ID чата/канала</Label>
        <Input 
          id="chatId" 
          placeholder="@channel_name или chat_id"
          defaultValue={channel?.chatId}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="token">API токен/ключ</Label>
        <Textarea 
          id="token"
          placeholder="Введите токен бота или API ключ..."
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Токен будет зашифрован и сохранен безопасно
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="active" defaultChecked={channel?.status === "active"} />
        <Label htmlFor="active">Активировать канал</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={onSave}>
          {channel ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </div>
  )

  const ScheduleForm = ({ schedule, onSave, onCancel }: any) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channel">Канал</Label>
        <Select defaultValue={schedule?.channel}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите канал" />
          </SelectTrigger>
          <SelectContent>
            {channels.filter(c => c.status === "active").map(channel => (
              <SelectItem key={channel.id} value={channel.type}>
                {getChannelIcon(channel.type)} {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="frequency">Частота публикации</Label>
        <Select defaultValue={schedule?.frequency}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите частоту" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Ежедневно</SelectItem>
            <SelectItem value="weekly">Еженедельно</SelectItem>
            <SelectItem value="custom">Настраиваемая</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Время публикации</Label>
        <Input 
          id="time" 
          type="time"
          defaultValue={schedule?.time}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newsCount">Количество новостей</Label>
        <Input 
          id="newsCount" 
          type="number"
          min="1"
          max="10"
          defaultValue={schedule?.newsCount}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="useRewriting" defaultChecked={schedule?.useRewriting} />
        <Label htmlFor="useRewriting">Использовать ИИ рерайтинг</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" defaultChecked={schedule?.isActive} />
        <Label htmlFor="isActive">Активировать расписание</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={onSave}>
          {schedule ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Управление публикациями</h1>
          <p className="text-muted-foreground">Настройка каналов и расписаний публикации</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активные каналы
            </CardTitle>
            <Send className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {channels.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">из {channels.length} настроенных</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Подписчиков
            </CardTitle>
            <Users className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {channels.reduce((acc, c) => acc + c.subscribers, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Общий охват</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Расписаний
            </CardTitle>
            <Clock className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {schedules.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Активных автопубликаций</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Последняя публикация
            </CardTitle>
            <Calendar className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">10:30</div>
            <p className="text-xs text-muted-foreground">Сегодня в Telegram</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="channels">Каналы</TabsTrigger>
          <TabsTrigger value="schedules">Расписания</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Настройка каналов</CardTitle>
                <CardDescription>
                  Подключение и управление каналами публикации
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="gradient" className="shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить канал
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Добавить новый канал</DialogTitle>
                    <DialogDescription>
                      Настройте подключение к социальной сети
                    </DialogDescription>
                  </DialogHeader>
                  <ChannelForm 
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Канал</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>ID/Адрес</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Подписчики</TableHead>
                    <TableHead>Последний пост</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(channel.type)}
                          <span className="capitalize">{channel.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {channel.chatId}
                      </TableCell>
                      <TableCell>{getStatusBadge(channel.status)}</TableCell>
                      <TableCell>
                        <span className="font-medium">{channel.subscribers.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(channel.lastPost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-warning/10 hover:text-warning"
                            onClick={() => setSelectedChannel(channel)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-info/10 hover:text-info"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Расписания публикаций</CardTitle>
                <CardDescription>
                  Автоматическая публикация по расписанию
                </CardDescription>
              </div>
              <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient" className="shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать расписание
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Создать расписание публикации</DialogTitle>
                    <DialogDescription>
                      Настройте автоматическую публикацию новостей
                    </DialogDescription>
                  </DialogHeader>
                  <ScheduleForm 
                    onSave={() => setIsScheduleDialogOpen(false)}
                    onCancel={() => setIsScheduleDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Канал</TableHead>
                    <TableHead>Частота</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead>Новостей</TableHead>
                    <TableHead>ИИ рерайт</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Последний запуск</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(schedule.channel)}
                          <span className="font-medium">{schedule.channelName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {schedule.frequency === "daily" ? "Ежедневно" : 
                           schedule.frequency === "weekly" ? "Еженедельно" : "Настраиваемая"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{schedule.time}</TableCell>
                      <TableCell>
                        <span className="font-medium">{schedule.newsCount}</span>
                      </TableCell>
                      <TableCell>
                        {schedule.useRewriting ? (
                          <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                            Да
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Нет
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.isActive ? (
                          <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                            <Play className="w-3 h-3 mr-1" />
                            Активно
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-muted/20 bg-muted/10">
                            <Pause className="w-3 h-3 mr-1" />
                            Приостановлено
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(schedule.lastRun)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-warning/10 hover:text-warning"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-success/10 hover:text-success"
                          >
                            {schedule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Channel Dialog */}
      <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать канал</DialogTitle>
            <DialogDescription>
              Изменить настройки для {selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <ChannelForm 
            channel={selectedChannel}
            onSave={() => setSelectedChannel(null)}
            onCancel={() => setSelectedChannel(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}