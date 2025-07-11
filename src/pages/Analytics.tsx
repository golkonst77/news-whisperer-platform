import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts"
import { TrendingUp, TrendingDown, Eye, Share2, Bot, Clock } from "lucide-react"

const newsData = [
  { date: "01.12", спарсено: 45, опубликовано: 32, просмотры: 1250 },
  { date: "02.12", спарсено: 52, опубликовано: 41, просмотры: 1580 },
  { date: "03.12", спарсено: 48, опубликовано: 38, просмотры: 1320 },
  { date: "04.12", спарсено: 61, опубликовано: 45, просмотры: 1890 },
  { date: "05.12", спарсено: 55, опубликовано: 42, просмотры: 1650 },
  { date: "06.12", спарсено: 67, опубликовано: 51, просмотры: 2100 },
  { date: "07.12", спарсено: 72, опубликовано: 58, просмотры: 2340 },
]

const channelData = [
  { name: "Telegram", value: 45, color: "#0088fe" },
  { name: "VK", value: 30, color: "#00c49f" },
  { name: "WhatsApp", value: 25, color: "#ffbb28" },
]

const sourceData = [
  { name: "TechNews", новости: 156, эффективность: 85 },
  { name: "FinanceDaily", новости: 134, эффективность: 78 },
  { name: "ScienceWorld", новости: 98, эффективность: 92 },
  { name: "EcoNews", новости: 87, эффективность: 76 },
  { name: "SportUpdate", новости: 76, эффективность: 81 },
]

const metrics = [
  {
    title: "Среднее время парсинга",
    value: "2.4 мин",
    change: "-12%",
    trend: "down",
    icon: Clock,
    color: "text-info"
  },
  {
    title: "Эффективность ИИ",
    value: "94.2%",
    change: "+3.2%", 
    trend: "up",
    icon: Bot,
    color: "text-primary"
  },
  {
    title: "CTR публикаций",
    value: "8.7%",
    change: "+1.4%",
    trend: "up", 
    icon: Eye,
    color: "text-success"
  },
  {
    title: "Охват аудитории",
    value: "47.3K",
    change: "+5.8%",
    trend: "up",
    icon: Share2,
    color: "text-warning"
  }
]

export function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
        <p className="text-muted-foreground">Детальная статистика работы системы</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-xs ${metric.trend === "up" ? "text-success" : "text-destructive"}`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">за неделю</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News Processing Timeline */}
        <Card className="border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-foreground">Динамика обработки новостей</CardTitle>
            <CardDescription>Парсинг и публикация за последнюю неделю</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={newsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="спарсено" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="опубликовано" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--success))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card className="border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-foreground">Распределение по каналам</CardTitle>
            <CardDescription>Публикации в социальных сетях</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Trend */}
        <Card className="border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-foreground">Динамика просмотров</CardTitle>
            <CardDescription>Аудитория публикаций за неделю</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={newsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="просмотры" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card className="border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-foreground">Эффективность источников</CardTitle>
            <CardDescription>Количество новостей и качество контента</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Legend />
                <Bar dataKey="новости" fill="hsl(var(--primary))" />
                <Bar dataKey="эффективность" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border-border/50 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-foreground">Сводная статистика</CardTitle>
          <CardDescription>Ключевые показатели за текущий месяц</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Всего новостей</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-success">834</div>
              <div className="text-sm text-muted-foreground">Опубликовано</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-info">12</div>
              <div className="text-sm text-muted-foreground">Источников</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-warning">156</div>
              <div className="text-sm text-muted-foreground">В очереди</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-primary">67%</div>
              <div className="text-sm text-muted-foreground">Конверсия</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-success">94.2%</div>
              <div className="text-sm text-muted-foreground">ИИ точность</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}