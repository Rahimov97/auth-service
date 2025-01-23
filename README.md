# Сервис аутентификации и авторизации

**Функции**

- Аутентификация и авторизация пользователей с использованием JWT.
- Доступ к защищённым маршрутам (`/api/secret-info`).
- Функционал обновления токенов.
- Отзыв токенов (`accessToken` и `refreshToken`).
- Поддержка работы с несколькими устройствами (`deviceId` включён в payload токенов).
- Автоматический отзыв всех токенов устройства при попытке обновления отозванного токена.

**Используемые технологии**

- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Swagger**

**Установка и настройка**

### Требования

- Node.js (версии 16 или выше)
- PostgreSQL (настроенный и работающий локально или на сервере)

### Шаги для запуска проекта

1. **Клонируем репо:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Установка зависимости:**

   ```bash
   npm install
   ```

3. **Настройка переменных .env**

   Создать файл в корневой директории и добавить следующие параметры:
   ```env
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=postgres
    DATABASE_PASSWORD=your_password
    DATABASE_NAME=auth_service
    JWT_SECRET=your_jwt_secret
    ACCESS_TOKEN_EXPIRATION=1h
    REFRESH_TOKEN_EXPIRATION=7d
    JWT_EXPIRATION=1h
   ```
4. **Настройка базу данных:**

   PostgreSQL, создать базу данных с именем `auth_service`. TypeORM автоматически синхронизирует схему базы данных.

5. **Запуск приложения**

   ```bash
   npm run start
   ```

6. **Получите доступ к документации API:**

   По адресу [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## **Эндпоинты API**

### Эндпоинты аутентификации

#### **1. Вход (Login)**

**POST** `/auth/login`

Тело запроса:

```json
{
  "username": "testuser",
  "password": "testpassword",
  "deviceId": "device-1"
}
```

Ответ:

```json
{
  "accessToken": "eyJhbGciOiJUzI1NiIs...",
  "refreshToken": "eyJhbGiOiJIUzI1NiIs..."
}
```

#### **2. Обновление токенов**

**POST** `/auth/refresh`

Тело запроса:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "deviceId": "device-1"
}
```

Ответ:

```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

#### **3. Отзыв токенов**

**POST** `/auth/revoke`

Тело запроса:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "deviceId": "device-1"
}
```

Ответ:

```json
{
  "message": "Токен успешно отозван"
}
```

### Защищённые маршруты

#### **1. Секретная информация**

**GET** `/api/secret-info`

Заголовок:

```json
{
  "Authorization": "Bearer <accessToken>"
}
```

Ответ:

```json
{
  "message": "Это секретная информация. Только для авторизованных пользователей!",
  "user": {
    "userId": 1,
    "username": "testuser"
  }
}
```