import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

const sources = [
  {
    id: 1,
    name: "TechNews",
    url: "https://technews.ru",
    lastParsed: "2 часа назад",
    status: "active",
    newsCount: 156,
    successRate: 94
  },
  {
    id: 2,
    name: "FinanceDaily", 
    url: "https://finance-daily.com",
    lastParsed: "30 минут назад",
    status: "active",
    newsCount: 134,
    successRate: 87
  },
  {
    id: 3,
    name: "ScienceWorld",
    url: "https://science-world.org",
    lastParsed: "1 час назад", 
    status: "paused",
    newsCount: 98,
    successRate: 96
  },
  {
    id: 4,
    name: "EcoNews",
    url: "https://eco-news.net",
    lastParsed: "5 часов назад",
    status: "error",
    newsCount: 87,
    successRate: 72
  }
]

export function Sources() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="text-success border-success/20 bg-success/10">
          <CheckCircle className="w-3 h-3 mr-1" />
          Активен
        </Badge>
      case "paused":
        return <Badge variant="outline" className="text-warning border-warning/20 bg-warning/10">
          <Pause className="w-3 h-3 mr-1" />
          Приостановлен
        </Badge>
      case "error":
        return <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
          <XCircle className="w-3 h-3 mr-1" />
          Ошибка
        </Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const SourceForm = ({ source, onSave, onCancel }: any) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название источника</Label>
        <Input 
          id="name" 
          placeholder="Например: TechNews"
          defaultValue={source?.name}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url">URL сайта</Label>
        <Input 
          id="url" 
          placeholder="https://example.com"
          defaultValue={source?.url}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="selectors">Конфигурация парсинга</Label>
        <Textarea 
          id="selectors"
          placeholder="Введите CSS-селекторы для парсинга..."
          className="min-h-[100px]"
          defaultValue={source?.config}
        />
        <p className="text-xs text-muted-foreground">
          Укажите селекторы для заголовка, текста, даты и изображений
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="active" defaultChecked={source?.status === "active"} />
        <Label htmlFor="active">Активировать парсинг</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={onSave}>
          {source ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Источники новостей</h1>
          <p className="text-muted-foreground">Управление сайтами для парсинга</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Добавить источник
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавить новый источник</DialogTitle>
              <DialogDescription>
                Настройте парсинг нового новостного сайта
              </DialogDescription>
            </DialogHeader>
            <SourceForm 
              onSave={() => setIsAddDialogOpen(false)}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего источников
            </CardTitle>
            <Globe className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sources.length}</div>
            <p className="text-xs text-muted-foreground">+1 за неделю</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активных
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sources.filter(s => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Работают нормально</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средняя эффективность
            </CardTitle>
            <Eye className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(sources.reduce((acc, s) => acc + s.successRate, 0) / sources.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Качество парсинга</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего новостей
            </CardTitle>
            <Clock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sources.reduce((acc, s) => acc + s.newsCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Спарсено всего</p>
          </CardContent>
        </Card>
      </div>

      {/* Sources Table */}
      <Card className="border-border/50 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-foreground">Список источников</CardTitle>
          <CardDescription>
            Управляйте настройками парсинга для каждого сайта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний парсинг</TableHead>
                <TableHead>Новостей</TableHead>
                <TableHead>Эффективность</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {source.url}
                  </TableCell>
                  <TableCell>{getStatusBadge(source.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {source.lastParsed}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{source.newsCount}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${source.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{source.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-info/10 hover:text-info"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-warning/10 hover:text-warning"
                        onClick={() => setEditingSource(source)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-success/10 hover:text-success"
                      >
                        {source.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSource} onOpenChange={() => setEditingSource(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать источник</DialogTitle>
            <DialogDescription>
              Измените настройки парсинга для {editingSource?.name}
            </DialogDescription>
          </DialogHeader>
          <SourceForm 
            source={editingSource}
            onSave={() => setEditingSource(null)}
            onCancel={() => setEditingSource(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}