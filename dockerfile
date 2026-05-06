FROM node:24.14.0 as base
WORKDIR /usr/src/app

FROM base as build
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate --schema src/shared/infrastructure/database/prisma/schema.prisma 
RUN npm run build


FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate --schema src/shared/infrastructure/database/prisma/schema.prisma 
CMD ["sh", "-c", "npx prisma migrate dev --schema src/shared/infrastructure/database/prisma/schema.prisma && npm run start:dev"]

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/shared/infrastructure/database/prisma/schema.prisma ./src/shared/infrastructure/database/prisma/schema.prisma
RUN npx prisma generate --schema src/shared/infrastructure/database/prisma/schema.prisma
CMD ["sh", "-c", "npx prisma migrate deploy --schema src/shared/infrastructure/database/prisma/schema.prisma && node dist/main"]
