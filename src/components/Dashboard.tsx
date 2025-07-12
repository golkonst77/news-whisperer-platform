import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, FileText, Send, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

const stats = [
  {
    title: "Активные источники",
    value: "12",
    description: "Сайтов в работе",
    icon: Globe,
    color: "text-info",
    trend: "+2 за неделю"
  },
  {
    title: "Спарсено новостей",
    value: "1,247",
    description: "За последний месяц",
    icon: FileText,
    color: "text-primary",
    trend: "+18% к прошлому месяцу"
  },
  {
    title: "Опубликовано",
    value: "834",
    description: "Во всех каналах",
    icon: Send,
    color: "text-success",
    trend: "+15% к прошлому месяцу"
  },
  {
    title: "В очереди",
    value: "156",
    description: "Ожидают публикации",
    icon: Clock,
    color: "text-warning",
    trend: "Обновлено час назад"
  }
]

const recentNews = [
  {
    title: "Новое обновление ИИ-технологий в медицине",
    source: "TechNews",
    time: "2 часа назад",
    status: "published",
    channels: ["telegram", "vk"]
  },
  {
    title: "Изменения в законодательстве о цифровых валютах",
    source: "FinanceDaily",
    time: "4 часа назад", 
    status: "pending",
    channels: []
  },
  {
    title: "Прорыв в области квантовых вычислений",
    source: "ScienceWorld",
    time: "6 часов назад",
    status: "published",
    channels: ["telegram", "vk", "whatsapp"]
  },
  {
    title: "Новая экологическая инициатива крупных корпораций",
    source: "EcoNews",
    time: "8 часов назад",
    status: "draft",
    channels: []
  }
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
          <p className="text-muted-foreground">Обзор системы управления новостями</p>
        </div>
        <Button variant="gradient" className="shadow-glow">
          Запустить парсинг
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Последние новости</CardTitle>
            <CardDescription>Недавно спарсенные новости</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNews.map((news, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{news.source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{news.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {news.status === "published" && (
                      <CheckCircle className="w-3 h-3 text-success" />
                    )}
                    {news.status === "pending" && (
                      <Clock className="w-3 h-3 text-warning" />
                    )}
                    {news.status === "draft" && (
                      <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground capitalize">
                      {news.status === "published" ? "Опубликовано" : 
                       news.status === "pending" ? "В очереди" : "Черновик"}
                    </span>
                    {news.channels.length > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {news.channels.length} канал{news.channels.length > 1 ? "а" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Быстрые действия</CardTitle>
            <CardDescription>Основные функции системы</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Globe className="w-4 h-4 mr-2" />
              Добавить новый источник
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Просмотреть все новости
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Send className="w-4 h-4 mr-2" />
              Настроить публикацию
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Посмотреть аналитику
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Статус системы</CardTitle>
          <CardDescription>Текущее состояние компонентов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <div className="text-sm font-medium text-foreground">Парсер</div>
                <div className="text-xs text-muted-foreground">Работает нормально</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <div className="text-sm font-medium text-foreground">ИИ обработка</div>
                <div className="text-xs text-muted-foreground">Активна</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <div className="text-sm font-medium text-foreground">WhatsApp API</div>
                <div className="text-xs text-muted-foreground">Требует настройки</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}