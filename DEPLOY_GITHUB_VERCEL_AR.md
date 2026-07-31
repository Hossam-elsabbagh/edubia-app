# رفع تحديث Edubia على GitHub وVercel بدون حذف قاعدة البيانات القديمة

هذه النسخة مجهزة لتحديث المشروع الحالي، وليست مشروع Supabase جديدًا.

## ما الذي تم الحفاظ عليه؟

- نفس Supabase Project URL القديم: `https://mnelaptowbttvzhgorcj.supabase.co`
- نفس Supabase publishable key الموجود في المشروع القديم.
- كل الطلاب والجلسات والتقييمات القديمة.
- حساب المدرس القديم في Supabase Authentication.
- رابط Vercel الحالي عند تحديث نفس GitHub repository ونفس Vercel project.

## الخطوة 1 — خذ نسخة احتياطية من Supabase

قبل تشغيل ملف الترقية، افتح Supabase ثم:

1. افتح **Database → Backups** وتأكد من وجود نسخة احتياطية، أو صدّر قاعدة البيانات.
2. لا تنشئ Supabase project جديدًا.
3. لا تشغّل ملف `database.sql` لأنه مخصص فقط لقاعدة بيانات جديدة وفارغة.

## الخطوة 2 — شغّل تحديث Coordinator مرة واحدة

إذا سبق وشغّلت تحديث React الأساسي، افتح **Supabase → SQL Editor** وشغّل الملف:

```text
RUN_ONCE_COORDINATOR_FEATURES_UPGRADE.sql
```

هذا التحديث لا يحذف ولا يعدّل بيانات الطلاب أو الجلسات أو Feedback. هو يضيف فقط الدوال المطلوبة لعرض Feedback وحالة Busy داخل رابط Coordinator.

إذا لم تشغّل تحديث React الأساسي من قبل، شغّل بدلًا منه النسخة المحدثة من:

```text
RUN_ONCE_SAFE_DATABASE_UPGRADE.sql
```

هذا الملف ينشئ نسخة احتياطية داخل `edubia_backup` ثم يضيف الحسابات المتعددة والحضور ومميزات Coordinator الجديدة.

> استخدم حساب المدرس القديم أول مرة بعد التحديث. البيانات القديمة تُربط بأقدم حساب موجود في Supabase Auth، وهو حساب النسخة القديمة عادةً.

## الخطوة 3 — حدّث GitHub

1. فك ضغط ملف ZIP.
2. افتح المجلد الناتج.
3. ارفع **كل الملفات والمجلدات الموجودة بداخله** إلى جذر GitHub repository القديم.
4. وافق على استبدال الملفات القديمة التي تحمل الأسماء نفسها.
5. لا ترفع ملف ZIP نفسه داخل repository.
6. اعمل Commit على فرع الإنتاج، وغالبًا اسمه `main`.

يجب أن يكون `package.json` و`vercel.json` و`index.html` في جذر repository، وليس داخل مجلد إضافي.

## الخطوة 4 — إعداد Vercel

عند استخدام نفس Vercel project المرتبط بنفس GitHub repository، سيبدأ deployment تلقائيًا بعد الـ commit.

تحقق من الإعدادات التالية في **Vercel → Project Settings → Build and Deployment**:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: ./
```

ملف `vercel.json` في المشروع يحتوي على SPA rewrite حتى تعمل روابط مثل:

```text
/dashboard
/students
/follow-up
/coordinator?token=...
```

حتى عند فتحها مباشرة أو عمل Refresh.

## الخطوة 5 — متغيرات Supabase على Vercel

المشروع سيعمل مباشرة لأن نفس إعدادات Supabase القديمة محفوظة في:

```text
public/config.js
```

يمكنك أيضًا إضافة القيم نفسها في **Vercel → Settings → Environment Variables**:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

لا تستخدم `service_role` أو secret key داخل React أو GitHub.

## الخطوة 6 — إعداد روابط تسجيل الحساب

في **Supabase → Authentication → URL Configuration**:

- اجعل **Site URL** هو رابط Vercel الأساسي الحالي.
- أضف رابط Vercel إلى **Redirect URLs**.
- إذا كان تأكيد البريد الإلكتروني مفعّلًا، المدرس الجديد سيحتاج لتأكيد بريده قبل تسجيل الدخول.

## اختبار سريع بعد النشر

1. سجل الدخول بالحساب القديم وتأكد أن الطلاب والجلسات القديمة ظاهرة.
2. افتح صفحة **FOLLOW UP** وسجل حضور يوم تجريبي.
3. أنشئ حساب مدرس جديد وتأكد أن حسابه يبدأ فارغًا ولا يرى بيانات المدرس القديم.
4. افتح رابط Coordinator وتأكد من ظهور Schedule & availability وStudent feedback.
5. جرّب Download PDF من Feedback وتأكد أنه ينزل مباشرة بدون Pop-up.
6. افتح رابط `/follow-up` مباشرة ثم اعمل Refresh للتأكد من عدم ظهور 404.
