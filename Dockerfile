# Используем официальный образ Node.js
FROM node:18-alpine

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

# Открываем порт 3000
EXPOSE 3000

# Запускаем сервер с собранным приложением
CMD ["serve", "-s", "build", "-l", "3000"]