# Используем официальный образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем React приложение для продакшена
RUN npm run build

# Устанавливаем простой HTTP сервер для раздачи статики
RUN npm install -g serve

# Открываем порт
EXPOSE $PORT

# Запускаем сервер с папкой dist (не build!)
CMD ["sh", "-c", "serve -s dist -l $PORT"]