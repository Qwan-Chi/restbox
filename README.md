# Restbox 🔩

Браузерный REST-клиент со встроенным AI-ассистентом **Rusty**.

Rusty анализирует ответы API, объясняет структуру данных, находит аномалии и предлагает готовый код обработки на нужном языке.

## Возможности

### REST-клиент
- Методы: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`
- Редакторы: Headers, Body (JSON / form-data / raw / binary), Params, Auth (Bearer / Basic / API Key)
- Интерактивный JSON-viewer с подсветкой типов, сворачиванием и поиском
- Вкладки ответа: Body, Headers, Timeline
- Автоматический подсчёт времени и размера ответа
- Обработка CORS-ошибок с понятным объяснением

### AI-ассистент Rusty
- **Любой провайдер** на выбор: DeepSeek, OpenAI, Anthropic (Claude), Groq, Mistral или Custom (OpenAI-совместимый)
- Ключ API вводится через UI — ничего не утекает в код
- Стриминг ответов в реальном времени
- Автоматический анализ ответа после каждого запроса
- Эвристика аномалий: пустые массивы, `null` в id-полях, секреты в ответе, медленные ответы, ошибки при статусе 200 и др.
- Быстрые действия: объяснить ответ, найти проблемы, сгенерировать код (JS/Python), проверить безопасность
- Мульти-чаты с историей (персистентны в localStorage)

### Интерфейс
- Тёмная тема
- **Переключатель языка RU/EN** (включая язык ответов Rusty)
- **Изменяемая ширина всех панелей** перетаскиванием (Sidebar, редактор, ответ, Rusty)
- История запросов (до 100, персистентна)
- Коллекции сохранённых запросов (персистентны)
- Генерация сниппетов кода: JavaScript, TypeScript, Python, cURL, Go, Rust

## Стек

- **React 18** + **TypeScript** (strict mode)
- **Vite 5**
- **Tailwind CSS 3**
- **Zustand** + **Immer** (состояние с персистентностью в localStorage)
- **react-markdown** + **rehype-highlight** (рендер ответов AI)

## Запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:5173

### Настройка AI

1. Нажми **⚙** в шапке панели Rusty
2. Выбери провайдера (DeepSeek, OpenAI, Claude и др.)
3. Введи свой API-ключ
4. Нажми **Проверить**, затем **Сохранить**

Ключ хранится только в localStorage твоего браузера. В проекте нет предзаданных ключей.

## Сборка

```bash
npm run build      # production-сборка в dist/
npm run typecheck  # проверка типов
npm run preview    # предпросмотр production-сборки
```

## Структура проекта

```
src/
├── types/            # TypeScript-типы
├── store/            # Zustand-сторы (request, history, collections, rusty, layout, apikey, i18n)
├── services/         # httpClient, rusty (AI), providers
├── hooks/            # useRequest, useRusty
├── utils/            # formatJson, detectAnomaly, languageTemplates, storage, i18n, cn
└── components/
    ├── layout/       # Sidebar, MainPanel, RustyPanel, ResizeHandle, LanguageSwitcher
    ├── request/      # MethodSelect, UrlInput, SendButton, TabsEditor, *Editor
    ├── response/     # ResponsePanel, StatusBadge, ResponseTabs, JsonViewer, ResponseMeta
    └── rusty/        # RustyChat, RustyMessage, RustyInput, RustyActions, RustyChatList, ApiKeyModal
```

## Лицензия

MIT
