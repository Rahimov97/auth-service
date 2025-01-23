# Сервис аутентификации и авторизации

Этот проект реализует сервис для аутентификации и авторизации пользователей с использованием JSON Web Tokens (JWT).

**Функциональность**

- Аутентификация и авторизация пользователей с использованием JWT.
- Доступ к защищённым маршрутам (`/api/secret-info`).
- Функционал обновления токенов.
- Отзыв токенов (`accessToken` и `refreshToken`).
- Поддержка работы с несколькими устройствами (`deviceId` включён в payload токенов).
- Автоматический отзыв всех токенов устройства при попытке обновления отозванного токена.

**Используемые технологии**

- **NestJS**: Фреймворк для создания эффективных и масштабируемых серверных приложений.
- **TypeORM**: ORM для работы с PostgreSQL.
- **PostgreSQL**: Реляционная база данных для хранения информации о пользователях и токенах.
- **Swagger**: Автоматическая документация API.

**Установка и настройка**

### Требования

- Node.js (версии 16 или выше)
- PostgreSQL (настроенный и работающий локально или на сервере)

### Шаги для запуска проекта

1. **Клонируйте репозиторий:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Установите зависимости:**

   ```bash
   npm install
   ```

3. **Настройте переменные окружения:**

   Создайте файл в корневой директории и добавьте следующие параметры:
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
4. **Настройте базу данных:**

   Убедитесь, что ваш сервер PostgreSQL работает, и создайте базу данных с именем `auth_service`. TypeORM автоматически синхронизирует схему базы данных.

5. **Запустите приложение:**

   ```bash
   npm run start
   ```

6. **Получите доступ к документации API:**

   Откройте браузер и перейдите по адресу [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

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
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
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

Заголовки:

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

## **Скрипты для разработки**

- **Запуск приложения:**

  ```bash
  npm run start
  ```

- **Запуск в режиме разработки:**

  ```bash
  npm run start:dev
  ```

- **Запуск тестов:**

  ```bash
  npm run test
  ```

## **Тестирование**

- Используйте Swagger по адресу [http://localhost:3000/api/docs](http://localhost:3000/api/docs) для интерактивного тестирования всех эндпоинтов.
- Убедитесь, что для доступа к защищённым маршрутам используются валидные токены.

## **Возможные улучшения**

- Добавить ограничение количества запросов (rate limiting) для повышения безопасности.
- Реализовать регистрацию пользователей.
- Добавить E2E тесты для лучшего покрытия.
