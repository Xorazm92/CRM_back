<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# CRM_back

**CRM_back** — bu o‘quv markazlari va ta’lim muassasalari uchun mo‘ljallangan zamonaviy CRM tizimining backend qismi. Loyiha NestJS (TypeScript), Prisma ORM va Docker texnologiyalari asosida ishlab chiqilgan.

## Asosiy imkoniyatlar
- Talabalar, o‘qituvchilar, kurslar, to‘lovlar, davomat va topshiriqlarni boshqarish
- Modular arxitektura va kengaytiriladigan kod
- JWT asosida autentifikatsiya va rollar boshqaruvi
- Prisma ORM orqali ma’lumotlar bazasi bilan ishlash
- Docker yordamida tez va oson ishga tushirish
- Testlar va kod sifati uchun ESLint, Prettier, Husky

## Loyiha tuzilmasi
```
CRM_back/
├── src/
│   ├── api/           # Asosiy modullar (student, teacher, payment, ...)
│   ├── common/        # Umumiy util, decorator, exception va boshqalar
│   ├── core/          # Auth va users uchun yadro logika
│   ├── infrastructure/# Prisma va boshqa tashqi integratsiyalar
│   └── main.ts        # Kirish nuqtasi
├── prisma/            # Prisma schema va migratsiyalar
├── logs/              # Log fayllar
├── docker-compose.yml # Docker konfiguratsiyasi
├── .env.example       # Namuna muhit sozlamalari
└── README.md
```

## Ishga tushirish

1. **.env faylini sozlang**
   .env.example faylidan nusxa olib, kerakli qiymatlarni to‘ldiring:
   ```bash
   cp .env.example .env
   ```
2. **Docker yordamida ishga tushirish**
   ```bash
   docker-compose up --build
   ```
3. **Yoki lokalda**
   ```bash
   npm install
   npx prisma generate
   npm run start:dev
   ```

## .env namunasi
```
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"
JWT_SECRET="your_jwt_secret"
PORT=3000
```

## Testlarni ishga tushirish
```bash
npm run test
npm run test:e2e
npm run test:cov
```

## API hujjatlari
Swagger yoki Postman collection orqali API endpointlari bilan ishlash mumkin. (Swagger: `localhost:3000/api` yoki loyihada mavjud bo‘lsa)

## Universal User API (CRM/LMS)

**Professional, scalable, and secure user management system for CRM/LMS projects.**

### Universal User Model
- Bitta model orqali barcha rollar: Student, Teacher, Admin, Manager
- CRUD, filter, search, profile, password change
- Secure password hashing, email uniqueness
- Robust validation, error handling
- Swagger documentation (`/api`)

### API misollar
- **Filter users:**
  ```http
  GET /users/filter?role=TEACHER&status=ACTIVE&search=ali
  ```
- **Profile:**
  ```http
  GET /users/profile
  ```
- **Change password:**
  ```http
  PUT /users/:id/password
  ```

### Security
- JWT authentication (Bearer token)
- Passwords are hashed
- Email and username are unique

### Swagger
- Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)

---

Agar universal user API yoki boshqa modullar bo‘yicha savollaringiz bo‘lsa, bemalol murojaat qiling!

Agar savollar yoki takliflar bo‘lsa, bemalol murojaat qiling!
