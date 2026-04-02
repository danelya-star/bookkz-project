# BookKZ — Онлайн-система бронирования и оплаты

![BookKZ](https://img.shields.io/badge/BookKZ-v1.0.0-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb)

Современное веб-приложение для бронирования отелей, ресторанов, мероприятий и трансферов с онлайн-оплатой (симуляция).

---

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- MongoDB (локально или [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Клонирование

```bash
git clone <repo-url>
cd cursovaya
```

### 2. Настройка Backend

```bash
cd server
npm install
cp .env.example .env
# Отредактируйте .env: укажите MONGO_URI и JWT_SECRET
```

**`.env` файл:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/booking_system
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Наполнение базы данных

```bash
cd server
node seed.js
```

Это создаст:
- 8 тестовых услуг (отели, рестораны, мероприятия, транспорт)
- Аккаунт администратора: `admin@booking.kz` / `admin123`
- Аккаунт пользователя: `user@booking.kz` / `user1234`

### 4. Запуск Backend

```bash
cd server
npm run dev   # с nodemon (авто-перезапуск)
# или
npm start
```

Сервер запустится на `http://localhost:5000`

### 5. Настройка и запуск Frontend

```bash
cd client
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`

---

## 🏗 Структура проекта

```
cursovaya/
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js               # Подключение к MongoDB
│   ├── models/
│   │   ├── User.js             # Модель пользователя
│   │   ├── Service.js          # Модель услуги
│   │   └── Booking.js          # Модель бронирования
│   ├── controllers/
│   │   ├── authController.js   # Регистрация/Вход/Профиль
│   │   ├── serviceController.js # CRUD услуг
│   │   ├── bookingController.js # Управление бронированиями
│   │   ├── paymentController.js # Симуляция оплаты
│   │   └── adminController.js  # Admin панель
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── auth.js             # JWT + Admin guard
│   │   └── errorHandler.js     # Глобальная обработка ошибок
│   ├── server.js               # Точка входа сервера
│   ├── seed.js                 # Наполнение БД тестовыми данными
│   └── .env.example
│
└── client/                     # Frontend (React + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Глобальное состояние авторизации
    │   │   └── ToastContext.jsx # Уведомления об успехе/ошибке
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ServicesPage.jsx
    │   │   ├── ServiceDetailPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── BookingsPage.jsx
    │   │   ├── PaymentPage.jsx
    │   │   ├── AdminPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── services/
    │   │   └── api.js          # Axios + все API-запросы
    │   ├── App.jsx             # React Router + защита маршрутов
    │   ├── main.jsx
    │   └── index.css           # Дизайн-система (CSS переменные)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔌 API Документация

Базовый URL: `http://localhost:5000/api`

### Аутентификация

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/auth/register` | Регистрация нового пользователя | Public |
| POST | `/auth/login` | Вход в систему | Public |
| GET | `/auth/me` | Данные текущего пользователя | Private |
| PUT | `/auth/profile` | Обновление профиля | Private |
| PUT | `/auth/password` | Смена пароля | Private |

**Пример запроса (Регистрация):**
```json
POST /api/auth/register
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "secret123",
  "phone": "+7 700 000 0000"
}
```

**Пример ответа:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "Иван Иванов", "role": "user" }
}
```

### Услуги

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/services` | Список услуг (с фильтрами) | Public |
| GET | `/services/:id` | Детали одной услуги | Public |
| GET | `/services/admin/all` | Все услуги для админа | Admin |
| POST | `/services` | Создать услугу | Admin |
| PUT | `/services/:id` | Обновить услугу | Admin |
| DELETE | `/services/:id` | Удалить (soft delete) | Admin |

**Query-параметры для GET /services:**
```
?category=hotel&minPrice=10000&maxPrice=50000&search=алматы&page=1&limit=9&sort=-rating
```

### Бронирования

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/bookings` | Создать бронирование | Private |
| GET | `/bookings/my` | Бронирования текущего пользователя | Private |
| GET | `/bookings/:id` | Детали бронирования | Private |
| PUT | `/bookings/:id/cancel` | Отменить бронирование | Private |
| GET | `/bookings/admin` | Все бронирования | Admin |

### Оплата

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/payments/pay` | Провести оплату | Private |
| GET | `/payments/:bookingId` | Статус оплаты | Private |

**Пример запроса (Оплата картой):**
```json
POST /api/payments/pay
{
  "bookingId": "65f1234abc...",
  "paymentMethod": "card",
  "cardNumber": "4111 1111 1111 1111",
  "cardHolder": "IVAN IVANOV",
  "expiry": "12/28",
  "cvv": "123"
}
```

> ⚠ Карта с номером, заканчивающимся на `0000`, всегда отклоняется (для тестирования отказа).

### Admin

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/admin/stats` | Статистика системы | Admin |
| GET | `/admin/users` | Список пользователей | Admin |
| PUT | `/admin/users/:id/role` | Изменить роль пользователя | Admin |

---

## 🛠 Технологии

### Frontend
- **React 18** — функциональные компоненты + Hooks
- **React Router v6** — навигация и защищённые маршруты
- **Axios** — HTTP-клиент с interceptors
- **React Icons** — иконки
- **Vite** — сборщик

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — база данных и ODM
- **bcryptjs** — хэширование паролей
- **jsonwebtoken** — JWT авторизация
- **cors, dotenv** — утилиты

### Безопасность
- Пароли хранятся в хэшированном виде (bcrypt, 10 rounds)
- JWT токены с истечением срока (7 дней)
- Middleware для проверки ролей (user / admin)
- Валидация на клиенте и сервере

---

## 👤 Демо-аккаунты (после seed.js)

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@booking.kz | admin123 |
| Пользователь | user@booking.kz | user1234 |

---

## ✅ Тестирование через Postman

1. Импортируйте коллекцию (или создайте вручную)
2. Выполните `POST /api/auth/login` → скопируйте `token`
3. Добавьте заголовок: `Authorization: Bearer <token>`
4. Тестируйте остальные эндпоинты

---

## 📊 Возможности системы

- [x] Регистрация / вход с JWT
- [x] Личный кабинет (смена профиля, пароля)
- [x] Каталог услуг с поиском и фильтрами
- [x] Детальная страница услуги
- [x] Бронирование с расчётом цены
- [x] Симуляция онлайн-оплаты (карта / Kaspi / Halyk)
- [x] История бронирований с отменой
- [x] Admin-панель (CRUD услуг, пользователи, статистика)
- [x] Адаптивный дизайн (мобильные, планшеты, ПК)
- [x] Toast-уведомления
- [x] Обработка ошибок (404, валидация, серверные ошибки)
