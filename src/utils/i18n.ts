import { useI18nStore, type Language } from '@/store/useI18nStore'

type Dict = Record<string, string>

const ru: Dict = {
  // Sidebar
  'sidebar.history': 'История',
  'sidebar.collections': 'Коллекции',
  'sidebar.historyEmpty': 'История пуста. Отправь первый запрос.',
  'sidebar.collectionsEmpty': 'Нет коллекций. Создай первую, чтобы сохранять запросы.',
  'sidebar.newCollection': '+ Новая коллекция',
  'sidebar.clearHistory': 'Очистить историю',
  'sidebar.untitled': '(без названия)',
  'sidebar.deleteCollection': 'Удалить коллекцию',
  'sidebar.deleteRequest': 'Удалить запрос',
  'sidebar.collectionName': 'Название коллекции',

  // MethodSelect
  'method.title': 'Метод',

  // UrlInput
  'url.placeholder': 'https://api.example.com/v1/endpoint',
  'url.save': 'Сохранить в коллекцию',
  'url.saveTitle': 'Сохранить запрос',
  'url.saveRequest': 'Сохранить запрос',
  'url.requestName': 'Имя запроса',
  'url.collection': 'Коллекция',
  'url.selectCollection': '— выбери коллекцию —',
  'url.newCollection': '+ Создать новую коллекцию',
  'url.newCollectionName': 'Название коллекции',
  'url.cancel': 'Отмена',
  'url.saveBtn': 'Сохранить',

  // SendButton
  'send.sending': 'Отправляю...',
  'send.send': 'Send',

  // TabsEditor
  'tabs.params': 'Params',
  'tabs.headers': 'Headers',
  'tabs.body': 'Body',
  'tabs.auth': 'Auth',

  // KeyValueEditor
  'kv.key': 'key',
  'kv.value': 'value',
  'kv.add': '+ Добавить',
  'kv.enable': 'Включить',
  'kv.delete': 'Удалить',

  // BodyEditor
  'body.none': 'Этот запрос не имеет тела.',
  'body.validJson': '✓ Валидный JSON',
  'body.invalidJson': '✗ Невалидный JSON',
  'body.jsonPlaceholder': '{\n  "key": "value"\n}',
  'body.rawPlaceholder': 'Тело запроса...',

  // AuthEditor
  'auth.none': 'Авторизация не используется.',
  'auth.noAuth': 'No Auth',
  'auth.bearer': 'Bearer Token',
  'auth.basic': 'Basic Auth',
  'auth.apiKey': 'API Key',
  'auth.token': 'Token',
  'auth.username': 'Username',
  'auth.password': 'Password',
  'auth.key': 'Key',
  'auth.value': 'Value',
  'auth.addTo': 'Add to',
  'auth.header': 'Header',
  'auth.queryParam': 'Query Param',

  // ResponsePanel
  'response.waiting': 'Ожидаю ответ...',
  'response.empty': 'Ответ появится здесь после отправки запроса.',
  'response.emptyHint': 'Введи URL, выбери метод и нажми Send.',
  'response.problems': 'проблем',
  'response.problem': 'проблема',

  // ResponseTabs
  'response.body': 'Body',
  'response.headers': 'Headers',
  'response.timeline': 'Timeline',
  'response.bodyEmpty': 'Тело ответа пустое.',
  'response.noHeaders': 'Заголовки отсутствуют.',
  'response.received': 'Получен ответ',
  'response.totalTime': 'Общее время',
  'response.bodySize': 'Размер тела',
  'response.fetchResult': 'Результат fetch',
  'response.success': 'success',
  'response.failure': 'failure',

  // JsonViewer
  'json.search': 'Поиск по ключу или значению... (Ctrl+F)',
  'json.copyAll': 'Copy all',
  'json.copy': 'Скопировать',
  'json.items': 'items',
  'json.item': 'item',
  'json.keys': 'keys',

  // StatusBadge
  'status.networkError': 'Network Error',

  // RustyPanel
  'rusty.idle': 'ожидание',
  'rusty.online': 'онлайн',
  'rusty.thinking': 'думаю...',
  'rusty.error': 'ошибка API',
  'rusty.noApiKey': 'нет API-ключа',
  'rusty.chats': 'Список чатов',
  'rusty.newChat': 'Новый чат',
  'rusty.clear': 'Очистить',
  'rusty.clearCurrent': 'Очистить текущий чат',
  'rusty.settings': 'Настройки API-ключа',
  'rusty.insertKey': '🔑 Настрой AI-провайдера',
  'rusty.insertKeyHint': 'Выбери провайдера (DeepSeek, OpenAI, Claude и др.) и введи свой API-ключ. Нажми сюда, чтобы настроить.',

  // RustyChat
  'rusty.hello': 'Привет! Я Rusty 🔩',
  'rusty.helloHint': 'Отправь запрос — я автоматически проанализирую ответ. Или задай вопрос ниже.',
  'rusty.thinkingDots': 'думаю...',

  // RustyInput
  'rusty.inputPlaceholder': 'Спроси Rusty... (Enter — отправить, Shift+Enter — перенос)',
  'rusty.stop': '⏹ Стоп',

  // RustyActions
  'action.explain': '🔍 Объясни ответ',
  'action.findProblems': '⚠️ Найди проблемы',
  'action.codeJs': '📝 Код на JS',
  'action.codePython': '🐍 Код на Python',
  'action.whatNext': '💡 Что дальше',
  'action.security': '🔒 Проверь безопасность',

  // RustyChatList
  'chatList.title': 'Чаты',
  'chatList.new': '+ Новый',
  'chatList.delete': 'Удалить чат',
  'chatList.newChat': 'Новый чат',
  'chatList.justNow': 'только что',
  'chatList.minAgo': 'мин назад',
  'chatList.hourAgo': 'ч назад',
  'chatList.dayAgo': 'дн назад',
  'chatList.messages': 'сообщ.',

  // ApiKeyModal
  'apikey.title': '⚙ Настройки Rusty',
  'apikey.label': 'DeepSeek API-ключ',
  'apikey.placeholder': 'sk-...',
  'apikey.show': 'Показать',
  'apikey.hide': 'Скрыть',
  'apikey.save': 'Сохранить',
  'apikey.saved': '✓ Сохранено',
  'apikey.test': 'Проверить',
  'apiKey.testing': 'Проверка...',
  'apikey.remove': 'Удалить',
  'apikey.storageNote': 'Ключ хранится только в этом браузере (localStorage) и отправляется напрямую в API провайдера.',
  'apikey.getKey': 'Получить ключ:',

  // LanguageSwitcher
  'lang.switch': 'Сменить язык',
}

const en: Dict = {
  'sidebar.history': 'History',
  'sidebar.collections': 'Collections',
  'sidebar.historyEmpty': 'History is empty. Send your first request.',
  'sidebar.collectionsEmpty': 'No collections. Create one to save requests.',
  'sidebar.newCollection': '+ New collection',
  'sidebar.clearHistory': 'Clear history',
  'sidebar.untitled': '(untitled)',
  'sidebar.deleteCollection': 'Delete collection',
  'sidebar.deleteRequest': 'Delete request',
  'sidebar.collectionName': 'Collection name',

  'method.title': 'Method',

  'url.placeholder': 'https://api.example.com/v1/endpoint',
  'url.save': 'Save to collection',
  'url.saveTitle': 'Save request',
  'url.saveRequest': 'Save request',
  'url.requestName': 'Request name',
  'url.collection': 'Collection',
  'url.selectCollection': '— select collection —',
  'url.newCollection': '+ Create new collection',
  'url.newCollectionName': 'Collection name',
  'url.cancel': 'Cancel',
  'url.saveBtn': 'Save',

  'send.sending': 'Sending...',
  'send.send': 'Send',

  'tabs.params': 'Params',
  'tabs.headers': 'Headers',
  'tabs.body': 'Body',
  'tabs.auth': 'Auth',

  'kv.key': 'key',
  'kv.value': 'value',
  'kv.add': '+ Add',
  'kv.enable': 'Enable',
  'kv.delete': 'Delete',

  'body.none': 'This request has no body.',
  'body.validJson': '✓ Valid JSON',
  'body.invalidJson': '✗ Invalid JSON',
  'body.jsonPlaceholder': '{\n  "key": "value"\n}',
  'body.rawPlaceholder': 'Request body...',

  'auth.none': 'No authentication used.',
  'auth.noAuth': 'No Auth',
  'auth.bearer': 'Bearer Token',
  'auth.basic': 'Basic Auth',
  'auth.apiKey': 'API Key',
  'auth.token': 'Token',
  'auth.username': 'Username',
  'auth.password': 'Password',
  'auth.key': 'Key',
  'auth.value': 'Value',
  'auth.addTo': 'Add to',
  'auth.header': 'Header',
  'auth.queryParam': 'Query Param',

  'response.waiting': 'Waiting for response...',
  'response.empty': 'Response will appear here after sending a request.',
  'response.emptyHint': 'Enter URL, choose method and click Send.',
  'response.problems': 'problems',
  'response.problem': 'problem',

  'response.body': 'Body',
  'response.headers': 'Headers',
  'response.timeline': 'Timeline',
  'response.bodyEmpty': 'Response body is empty.',
  'response.noHeaders': 'No headers.',
  'response.received': 'Response received',
  'response.totalTime': 'Total time',
  'response.bodySize': 'Body size',
  'response.fetchResult': 'fetch result',
  'response.success': 'success',
  'response.failure': 'failure',

  'json.search': 'Search by key or value... (Ctrl+F)',
  'json.copyAll': 'Copy all',
  'json.copy': 'Copy',
  'json.items': 'items',
  'json.item': 'item',
  'json.keys': 'keys',

  'status.networkError': 'Network Error',

  'rusty.idle': 'idle',
  'rusty.online': 'online',
  'rusty.thinking': 'thinking...',
  'rusty.error': 'API error',
  'rusty.noApiKey': 'no API key',
  'rusty.chats': 'Chat list',
  'rusty.newChat': 'New chat',
  'rusty.clear': 'Clear',
  'rusty.clearCurrent': 'Clear current chat',
  'rusty.settings': 'API key settings',
  'rusty.insertKey': '🔑 Set up AI provider',
  'rusty.insertKeyHint': 'Choose a provider (DeepSeek, OpenAI, Claude, etc.) and enter your API key. Click here to configure.',

  'rusty.hello': 'Hi! I am Rusty 🔩',
  'rusty.helloHint': 'Send a request — I will analyze the response automatically. Or ask a question below.',
  'rusty.thinkingDots': 'thinking...',

  'rusty.inputPlaceholder': 'Ask Rusty... (Enter to send, Shift+Enter for newline)',
  'rusty.stop': '⏹ Stop',

  'action.explain': '🔍 Explain response',
  'action.findProblems': '⚠️ Find problems',
  'action.codeJs': '📝 JS code',
  'action.codePython': '🐍 Python code',
  'action.whatNext': '💡 What next',
  'action.security': '🔒 Check security',

  'chatList.title': 'Chats',
  'chatList.new': '+ New',
  'chatList.delete': 'Delete chat',
  'chatList.newChat': 'New chat',
  'chatList.justNow': 'just now',
  'chatList.minAgo': 'min ago',
  'chatList.hourAgo': 'h ago',
  'chatList.dayAgo': 'd ago',
  'chatList.messages': 'msgs',

  'apikey.title': '⚙ Rusty Settings',
  'apikey.label': 'API key',
  'apikey.placeholder': 'sk-...',
  'apikey.show': 'Show',
  'apikey.hide': 'Hide',
  'apikey.save': 'Save',
  'apikey.saved': '✓ Saved',
  'apikey.test': 'Test',
  'apiKey.testing': 'Testing...',
  'apikey.remove': 'Remove',
  'apikey.storageNote': 'The key is stored only in this browser (localStorage) and sent directly to the provider API.',
  'apikey.getKey': 'Get key:',

  'lang.switch': 'Switch language',
}

const DICTS: Record<Language, Dict> = { ru, en }

export function useT() {
  const lang = useI18nStore((s) => s.lang)
  return (key: string): string => DICTS[lang][key] ?? DICTS.ru[key] ?? key
}

export function tStatic(lang: Language, key: string): string {
  return DICTS[lang][key] ?? DICTS.ru[key] ?? key
}
