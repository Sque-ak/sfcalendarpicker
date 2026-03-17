# superset-plugin-filter-calendar

Простой календарный фильтр для Apache Superset выбор даты одним кликом вместо многошагового.

## Возможности

- **Single Date** - клик по дате = фильтр по одному дню
- **Date Range** - выбор диапазона дат
- Настраиваемый формат отображения даты
- Работает как Native Filter в дашбордах

## Установка на сервер с Superset

### 1. Клонировать репозиторий на сервер

```bash
cd /tmp
git clone https://github.com/Sque-ak/sfcalanderpicker.git
cd sfcalanderpicker
```

### 2. Запустить скрипт установки

```bash
sudo bash install.sh /path/to/superset-frontend
```

Скрипт автоматически:

1. Скопирует плагин в `packages/` внутри superset-frontend
2. Добавит зависимость в `package.json`
3. Зарегистрирует плагин в `MainPreset`
4. Пересоберёт фронтенд (`npm install` + `npm run build`)

### 3. Перезапустить Superset

```bash
# Если работает через systemd:
sudo systemctl restart superset

# Если через Docker:
docker restart smartfinance-superset
```

## Использование

1. Открыть дашборд **Settings** (шестерёнка) **Filters**
2. Добавить фильтр тип **«Calendar Date»**
3. Выбрать режим: **Single Date** или **Date Range**
4. Указать scope (какие графики фильтрует)

## Ручная установка (без скрипта)

```bash
FRONTEND=/path/to/superset-frontend

# Скопировать в packages
cp -r . $FRONTEND/packages/superset-plugin-filter-calendar

# Добавить зависимость
cd $FRONTEND
# Отредактировать package.json — добавить:
#   "superset-plugin-filter-calendar": "file:./packages/superset-plugin-filter-calendar"

# Зарегистрировать в MainPreset
node scripts/register-plugin.js $FRONTEND

# Собрать
npm install --legacy-peer-deps && npm run build
```

## Совместимость

Протестировано на **Apache Superset 6.1.0rc1**. Использует `antd` и `dayjs`, которые уже входят в Superset.
