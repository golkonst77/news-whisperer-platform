import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Send,
  Eye,
  Bot,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

const news = [
  {
    id: 1,
    title: "Новое обновление ИИ-технологий в медицине",
    source: "TechNews",
    content: "Исследователи представили революционную технологию...",
    originalUrl: "https://technews.ru/ai-medicine-update",
    publishedDate: "2024-12-07T10:30:00",
    parsedAt: "2024-12-07T10:45:00",
    status: "published",
    channels: {
      telegram: true,
      vk: true,
      whatsapp: false
    },
    rewritten: true,
    imageCount: 2
  },
  {
    id: 2,
    title: "Изменения в законодательстве о цифровых валютах",
    source: "FinanceDaily",
    content: "Правительство объявило о новых правилах регулирования...",
    originalUrl: "https://finance-daily.com/crypto-regulation",
    publishedDate: "2024-12-07T08:15:00",
    parsedAt: "2024-12-07T08:30:00",
    status: "pending",
    channels: {
      telegram: false,
      vk: false,
      whatsapp: false
    },
    rewritten: false,
    imageCount: 1
  },
  {
    id: 3,
    title: "Прорыв в области квантовых вычислений",
    source: "ScienceWorld",
    content: "Ученые достигли нового рекорда в квантовых вычислениях...",
    originalUrl: "https://science-world.org/quantum-breakthrough",
    publishedDate: "2024-12-07T06:00:00",
    parsedAt: "2024-12-07T06:15:00",
    status: "published",
    channels: {
      telegram: true,
      vk: true,
      whatsapp: true
    },
    rewritten: true,
    imageCount: 3
  },
  {
    id: 4,
    title: "Новая экологическая инициатива крупных корпораций",
    source: "EcoNews",
    content: "Международные компании объединились для борьбы с изменением климата...",
    originalUrl: "https://eco-news.net/corp-eco-initiative",
    publishedDate: "2024-12-07T05:30:00",
    parsedAt: "2024-12-07T05:45:00",
    status: "draft",
    channels: {
      telegram: false,
      vk: false,
      whatsapp: false
    },
    rewritten: false,
    imageCount: 0
  }
]

export function News() {
  const [selectedNews, setSelectedNews] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="outline" className="text-success border-success/20 bg-success/10">
          <CheckCircle className="w-3 h-3 mr-1" />
          Опубликовано
        </Badge>
      case "pending":
        return <Badge variant="outline" className="text-warning border-warning/20 bg-warning/10">
          <Clock className="w-3 h-3 mr-1" />
          В очереди
        </Badge>
      case "draft":
        return <Badge variant="outline" className="text-muted-foreground border-muted/20 bg-muted/10">
          <XCircle className="w-3 h-3 mr-1" />
          Черновик
        </Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const getChannelBadges = (channels: any) => {
    const published = []
    if (channels.telegram) published.push("Telegram")
    if (channels.vk) published.push("VK")
    if (channels.whatsapp) published.push("WhatsApp")
    
    return published.length > 0 ? published.join(", ") : "Не опубликовано"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesSource = sourceFilter === "all" || item.source === sourceFilter
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const sources = [...new Set(news.map(item => item.source))]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Управление новостями</h1>
          <p className="text-muted-foreground">Просмотр и редактирование спарсенных новостей</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Bot className="w-4 h-4 mr-2" />
            Рерайт всех
          </Button>
          <Button variant="gradient" className="shadow-glow">
            <Send className="w-4 h-4 mr-2" />
            Опубликовать выбранные
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего новостей
            </CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{news.length}</div>
            <p className="text-xs text-muted-foreground">За сегодня</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Опубликовано
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {news.filter(n => n.status === "published").length}
            </div>
            <p className="text-xs text-muted-foreground">В соцсетях</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              В очереди
            </CardTitle>
            <Clock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {news.filter(n => n.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Ожидают публикации</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              С ИИ обработкой
            </CardTitle>
            <Bot className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {news.filter(n => n.rewritten).length}
            </div>
            <p className="text-xs text-muted-foreground">Рерайтнуто</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-foreground">Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по заголовку или источнику..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="pending">В очереди</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Источник" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все источники</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card className="border-border/50 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-foreground">Список новостей</CardTitle>
          <CardDescription>
            Найдено {filteredNews.length} новостей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата парсинга</TableHead>
                <TableHead>Каналы</TableHead>
                <TableHead>ИИ</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="space-y-1 max-w-[300px]">
                      <div className="font-medium line-clamp-2">{item.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.publishedDate)}
                        {item.imageCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.imageCount} фото
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.source}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.parsedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getChannelBadges(item.channels)}</div>
                  </TableCell>
                  <TableCell>
                    {item.rewritten ? (
                      <Badge variant="outline" className="text-info border-info/20 bg-info/10">
                        <Bot className="w-3 h-3 mr-1" />
                        Да
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Нет
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-info/10 hover:text-info"
                        onClick={() => setSelectedNews(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => window.open(item.originalUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
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

      {/* News Detail Dialog */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="line-clamp-2">{selectedNews?.title}</DialogTitle>
            <DialogDescription>
              Источник: {selectedNews?.source} • {selectedNews && formatDate(selectedNews.parsedAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNews && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedNews.status)}
                {selectedNews.rewritten && (
                  <Badge variant="outline" className="text-info border-info/20 bg-info/10">
                    <Bot className="w-3 h-3 mr-1" />
                    ИИ обработка
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(selectedNews.originalUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Оригинал
                </Button>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{selectedNews.content}</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
                <Button variant="outline">
                  <Bot className="w-4 h-4 mr-2" />
                  Рерайт
                </Button>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Опубликовать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}