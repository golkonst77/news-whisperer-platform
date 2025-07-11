import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2
} from "lucide-react"

export function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground">Общие настройки системы и персонализация</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Сброс
          </Button>
          <Button variant="gradient" className="shadow-glow">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="data">Данные</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Профиль пользователя
              </CardTitle>
              <CardDescription>
                Основная информация о пользователе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input id="username" placeholder="admin" defaultValue="admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="admin@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground">Интерфейс</CardTitle>
              <CardDescription>
                Настройки внешнего вида приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Язык интерфейса</Label>
                <Select defaultValue="ru">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select defaultValue="europe/moscow">
                  <SelectTrigger className="w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/moscow">Europe/Moscow (UTC+3)</SelectItem>
                    <SelectItem value="europe/london">Europe/London (UTC+0)</SelectItem>
                    <SelectItem value="america/new_york">America/New_York (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="compact-mode" />
                  <Label htmlFor="compact-mode">Компактный режим</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="animations" defaultChecked />
                  <Label htmlFor="animations">Анимации интерфейса</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-refresh" defaultChecked />
                  <Label htmlFor="auto-refresh">Автообновление данных</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground">Система</CardTitle>
              <CardDescription>
                Настройки работы системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="parse-interval">Интервал парсинга (минуты)</Label>
                <Input 
                  id="parse-interval" 
                  type="number" 
                  defaultValue="30"
                  min="5"
                  max="1440"
                  className="w-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-news">Максимум новостей за раз</Label>
                <Input 
                  id="max-news" 
                  type="number" 
                  defaultValue="50"
                  min="10"
                  max="500"
                  className="w-[200px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-parsing" defaultChecked />
                <Label htmlFor="auto-parsing">Автоматический парсинг</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email уведомления
              </CardTitle>
              <CardDescription>
                Настройка уведомлений по электронной почте
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email для уведомлений</Label>
                <Input 
                  id="notification-email" 
                  type="email" 
                  placeholder="notifications@example.com" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-errors" defaultChecked />
                  <Label htmlFor="email-errors">Ошибки парсинга</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="email-success" />
                  <Label htmlFor="email-success">Успешные публикации</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="email-daily" defaultChecked />
                  <Label htmlFor="email-daily">Ежедневная сводка</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="email-maintenance" defaultChecked />
                  <Label htmlFor="email-maintenance">Системные уведомления</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground">Push уведомления</CardTitle>
              <CardDescription>
                Мгновенные уведомления в браузере
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="push-errors" defaultChecked />
                  <Label htmlFor="push-errors">Критические ошибки</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="push-news" />
                  <Label htmlFor="push-news">Новые новости</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="push-published" />
                  <Label htmlFor="push-published">Успешные публикации</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Безопасность доступа
              </CardTitle>
              <CardDescription>
                Настройки безопасности и аутентификации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердить пароль</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button>Изменить пароль</Button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Тайм-аут сессии (часы)</Label>
                  <Input 
                    id="session-timeout" 
                    type="number" 
                    defaultValue="24"
                    min="1"
                    max="168"
                    className="w-[200px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="two-factor" />
                  <Label htmlFor="two-factor">Двухфакторная аутентификация</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="login-notifications" defaultChecked />
                  <Label htmlFor="login-notifications">Уведомления о входе</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground">API ключи</CardTitle>
              <CardDescription>
                Управление ключами доступа к API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Основной API ключ</Label>
                <div className="flex gap-2">
                  <Input 
                    value="sk-***************************"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">Показать</Button>
                  <Button variant="outline">Обновить</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ключ только для чтения</Label>
                <div className="flex gap-2">
                  <Input 
                    value="ro-***************************"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">Показать</Button>
                  <Button variant="outline">Обновить</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Database className="w-5 h-5" />
                Управление данными
              </CardTitle>
              <CardDescription>
                Резервное копирование и очистка данных
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Резервное копирование</h3>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Скачать бэкап
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Восстановить
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Последний бэкап: 07.12.2024 10:30
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-backup" defaultChecked />
                    <Label htmlFor="auto-backup">Автоматическое резервное копирование</Label>
                  </div>
                  
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="backup-interval">Интервал (дни)</Label>
                    <Input 
                      id="backup-interval" 
                      type="number" 
                      defaultValue="7"
                      min="1"
                      max="30"
                      className="w-[200px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Очистка данных</h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="retention-period">Хранить новости (дни)</Label>
                      <Input 
                        id="retention-period" 
                        type="number" 
                        defaultValue="90"
                        min="7"
                        max="365"
                        className="w-[200px]"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="auto-cleanup" defaultChecked />
                      <Label htmlFor="auto-cleanup">Автоматическая очистка старых данных</Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-destructive mb-2">Опасная зона</h3>
                  <div className="space-y-2">
                    <Button variant="destructive" className="w-fit">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Очистить все новости
                    </Button>
                    <Button variant="destructive" className="w-fit">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Сброс всех настроек
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Эти действия необратимы. Используйте с осторожностью.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground">Статистика хранения</CardTitle>
              <CardDescription>
                Информация об использовании дискового пространства
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-primary">2.4 GB</div>
                  <div className="text-sm text-muted-foreground">Новости</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-success">156 MB</div>
                  <div className="text-sm text-muted-foreground">Изображения</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-info">45 MB</div>
                  <div className="text-sm text-muted-foreground">Логи</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}