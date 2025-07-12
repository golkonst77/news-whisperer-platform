import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Settings,
  Zap,
  FileText,
  Wand2,
  TestTube,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

const aiProviders = [
  { 
    id: "openai", 
    name: "OpenAI GPT", 
    models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
    status: "connected"
  },
  { 
    id: "anthropic", 
    name: "Anthropic Claude", 
    models: ["claude-3-haiku", "claude-3-sonnet", "claude-3-opus"],
    status: "disconnected"
  },
  { 
    id: "yandex", 
    name: "Yandex GPT", 
    models: ["yandexgpt-lite", "yandexgpt-pro"],
    status: "disconnected"
  },
  { 
    id: "gigachat", 
    name: "GigaChat", 
    models: ["gigachat-lite", "gigachat-pro"],
    status: "disconnected"
  }
]

const rewritingPresets = [
  {
    id: "news",
    name: "Новостной стиль", 
    description: "Сухое изложение фактов, журналистский стиль",
    creativity: 0.3,
    length: "medium"
  },
  {
    id: "blog",
    name: "Блоговый стиль",
    description: "Более живой и персональный тон",
    creativity: 0.7,
    length: "long"
  },
  {
    id: "social",
    name: "Для соцсетей",
    description: "Краткий, цепляющий контент",
    creativity: 0.8,
    length: "short"
  },
  {
    id: "formal",
    name: "Официальный",
    description: "Строгий деловой стиль",
    creativity: 0.2,
    length: "medium"
  }
]

export function AISettings() {
  const [selectedProvider, setSelectedProvider] = useState("openai")
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
  const [creativity, setCreativity] = useState([0.7])
  const [selectedPreset, setSelectedPreset] = useState("news")
  const [useRewriting, setUseRewriting] = useState(true)
  const [testInput, setTestInput] = useState("")
  const [testOutput, setTestOutput] = useState("")
  const [isTesting, setIsTesting] = useState(false)

  const handleTest = async () => {
    if (!testInput.trim()) return
    
    setIsTesting(true)
    // Симуляция ИИ обработки
    setTimeout(() => {
      setTestOutput(`[РЕРАЙТ] ${testInput} -> Обработанный ИИ текст с измененной структурой и стилем...`)
      setIsTesting(false)
    }, 2000)
  }

  const getProviderStatus = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="outline" className="text-success border-success/20 bg-success/10">
          <CheckCircle className="w-3 h-3 mr-1" />
          Подключен
        </Badge>
      case "disconnected":
        return <Badge variant="outline" className="text-muted-foreground border-muted/20 bg-muted/10">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Не настроен
        </Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Настройки ИИ</h1>
          <p className="text-muted-foreground">Конфигурация искусственного интеллекта для обработки новостей</p>
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ИИ провайдер
            </CardTitle>
            <Brain className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">OpenAI</div>
            <p className="text-xs text-muted-foreground">gpt-3.5-turbo</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Обработано текстов
            </CardTitle>
            <FileText className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <p className="text-xs text-muted-foreground">За этот месяц</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Точность ИИ
            </CardTitle>
            <Zap className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">94.2%</div>
            <p className="text-xs text-muted-foreground">Качество рерайта</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Стоимость
            </CardTitle>
            <Settings className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$12.45</div>
            <p className="text-xs text-muted-foreground">За этот месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings */}
      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Провайдеры</TabsTrigger>
          <TabsTrigger value="rewriting">Рерайтинг</TabsTrigger>
          <TabsTrigger value="testing">Тестирование</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground">ИИ провайдеры</CardTitle>
              <CardDescription>
                Подключение и настройка провайдеров искусственного интеллекта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiProviders.map((provider) => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all border-2 ${
                      selectedProvider === provider.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        {getProviderStatus(provider.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-sm">Доступные модели:</Label>
                        <div className="flex flex-wrap gap-1">
                          {provider.models.map((model) => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* API Configuration */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/20">
                <h3 className="text-lg font-semibold text-foreground">
                  Настройка {aiProviders.find(p => p.id === selectedProvider)?.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API ключ</Label>
                    <Input 
                      id="apiKey" 
                      type="password"
                      placeholder="Введите API ключ..."
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Модель</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aiProviders.find(p => p.id === selectedProvider)?.models.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="provider-active" />
                  <Label htmlFor="provider-active">Использовать этого провайдера</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewriting Tab */}
        <TabsContent value="rewriting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card className="border-border/50 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-foreground">Основные настройки</CardTitle>
                <CardDescription>
                  Управление поведением рерайтинга
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enable-rewriting" 
                    checked={useRewriting}
                    onCheckedChange={setUseRewriting}
                  />
                  <Label htmlFor="enable-rewriting">Включить автоматический рерайтинг</Label>
                </div>

                <div className="space-y-3">
                  <Label>Уровень креативности: {creativity[0]}</Label>
                  <Slider
                    value={creativity}
                    onValueChange={setCreativity}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                    disabled={!useRewriting}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Консервативный</span>
                    <span>Креативный</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-prompt">Дополнительные инструкции</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="Добавьте специальные инструкции для ИИ..."
                    disabled={!useRewriting}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card className="border-border/50 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-foreground">Пресеты стилей</CardTitle>
                <CardDescription>
                  Готовые настройки для разных типов контента
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewritingPresets.map((preset) => (
                  <Card
                    key={preset.id}
                    className={`cursor-pointer transition-all border ${
                      selectedPreset === preset.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${!useRewriting ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => useRewriting && setSelectedPreset(preset.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{preset.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        {preset.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Креативность: {preset.creativity}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {preset.length === "short" ? "Короткий" :
                           preset.length === "medium" ? "Средний" : "Длинный"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card className="border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Тестирование ИИ
              </CardTitle>
              <CardDescription>
                Проверьте качество рерайтинга на примере текста
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input */}
                <div className="space-y-2">
                  <Label htmlFor="test-input">Исходный текст</Label>
                  <Textarea
                    id="test-input"
                    placeholder="Вставьте текст для тестирования рерайтинга..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button 
                    onClick={handleTest}
                    disabled={!testInput.trim() || isTesting}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Тест рерайтинга
                      </>
                    )}
                  </Button>
                </div>

                {/* Output */}
                <div className="space-y-2">
                  <Label htmlFor="test-output">Результат ИИ</Label>
                  <Textarea
                    id="test-output"
                    value={testOutput}
                    readOnly
                    placeholder="Здесь появится результат обработки ИИ..."
                    className="min-h-[200px] bg-muted/20"
                  />
                  {testOutput && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Принять
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Повторить
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Test History */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">История тестов</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-muted/20 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Тест #1</span>
                      <span className="text-muted-foreground">2 мин назад</span>
                    </div>
                    <p className="text-muted-foreground">
                      Оценка качества: <span className="text-success font-medium">92%</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}