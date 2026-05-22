# Документация проекта MANSVALVE

Индекс всех осознанно поддерживаемых материалов (без `node_modules`).

## Корень репозитория приложения

| Файл | Назначение |
|------|------------|
| `README.md` | Быстрый старт, env, деплой, аналитика, команды. |
| `ARCHITECTURE.md` | Полная архитектура: маршруты, каталог, админка, SEO, БД, скрипты. |
| `AGENTS.md` | Краткое напоминание для агентов про Next.js 16. |
| `CLAUDE.md` | Служебные заметки для Claude (если используются). |
| `admin-public-content-map.md` | **Legacy / дубль по смыслу:** русскоязычная карта CMS ↔ публичный сайт. Актуальная техкарта в `docs/admin-public-content-map.md`. |

## Папка `docs/`

| Файл | Назначение |
|------|------------|
| `README.md` | Этот индекс. |
| `project-status.md` | Краткий статус: что стабильно, потоки, техдолг. |
| `cleanup-candidates.md` | Что не удалили при зачистке и почему. |
| `product-content-contract.md` | Контракт контента карточки товара (публичный слой). |
| `catalog-templates.md` | Серии шаблонов / шаблоны каталога. |
| `admin-public-content-map.md` | Карта: откуда админка → что видит публичный сайт (`buildPublicProductView`, resolvers). |
| `admin-public-data-map.md` | Карта данных (смежный документ). |
| `admin-product-management-roadmap.md` | Roadmap админки по товарам. |
| `admin-workflow-stress-test.md` | Стресс-сценарии админских потоков. |
| `performance-reliability-audit.md` | Аудит производительности и надёжности. |
| `runtime-stability-audit.md` | Аудит стабильности runtime. |
| `site-bug-audit.md` | Баг-аудит сайта. |

## Связка «читать в каком порядке»

1. `README.md` — запуск и production env.  
2. `ARCHITECTURE.md` — единый источник правды по коду.  
3. `docs/project-status.md` — срез «что уже сделано».  
4. `docs/product-content-contract.md` + `docs/catalog-templates.md` — товарный контент и серии.  
5. Остальные `docs/*.md` — по задаче (админка, аудиты).
