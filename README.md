# StudyBox Student Portal

Independent Angular 17 application where students view their enrolled courses, timetable,
assignments, grades, attendance, discussions, classmates, finances, and reports.

```bash
npm install
npm start
```

Open `http://localhost:4300`. The app uses the student `/api/**` endpoints on the same backend as
the Admin app, so changes made by staff appear here after refresh.

Source layout:

```text
src/app/
├── student-portal/  route definition
├── pages/           student pages
├── shell/           Student Portal navigation
├── core/            student API, authentication, guard, and signal state
└── shared/          portal UI components
```
