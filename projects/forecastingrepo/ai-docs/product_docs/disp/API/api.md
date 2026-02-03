---
sidebar_position: 1
---
# API

Чистая логистика предоставляет доступ к данным в виде REST API и в виде обмена данными через Kafka.

## Авторизация для REST-запросов

> POST authenticate

`https://disp.t2.groupstp.ru/app/api/v1/authenticate`

Для авторизации пользователя нужно:

1. Создать POST-запрос для адреса выше 
2. Указать в **HEADER :**

   Content-type: application-json
3. Указать в **BODY**

```json
{"username":"***","password":"***"}
```

В ответе от сервера придет Bearer Token — токен авторизации пользователя. Этот токен нужно сохранить и во всех последующих запросах к серверу указать его в заголовке **Authorization**:

`Authorization: Bearer ваш_токен`

<details>
<summary>Пример POST-запроса</summary>

```yaml
POST /your-endpoint HTTP/1.1 (Указать конечный путь до метода, который хотите вызвать)
Host: your-api-host (Указать адресс сервера) 
Content-Type: application/json (Указать тип)
Authorization: Bearer (Вставить ваш токен)

{
  "key": "value"
}
```

</details>

<details>
<summary>Пример GET-запроса</summary>

```yaml
GET /your-endpoint HTTP/1.1 (Указать конечный путь до метода, который хотите вызвать)
Host: your-api-host (Указать адресс сервера) 
Authorization: Bearer (Вставить ваш_токен)
```

</details>
