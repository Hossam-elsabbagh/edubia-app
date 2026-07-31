# تحديث Edubia — Coordinator Feedback + Availability + PDF + New Logo

هذه النسخة مصممة لتُرفع إلى نفس GitHub repository المرتبط حاليًا بـVercel، وتستمر في استخدام نفس قاعدة بيانات Supabase القديمة بدون حذف أي طالب أو جلسة أو Feedback.

## 1) تحديث Supabase المطلوب

إذا كنت شغّلت ملف `RUN_ONCE_SAFE_DATABASE_UPGRADE.sql` من قبل، شغّل الآن الملف الصغير التالي مرة واحدة فقط:

```text
RUN_ONCE_COORDINATOR_FEATURES_UPGRADE.sql
```

من داخل:

```text
Supabase Dashboard → SQL Editor → New query → Run
```

هذا الملف لا يحذف ولا يعدّل البيانات الحالية. هو يضيف فقط دالتين آمنتين لعرض:

- الأوقات التي وضعها المدرس Busy داخل رابط Coordinator.
- جميع Feedback الخاصة بطلاب هذا المدرس داخل رابط Coordinator.

إذا لم تشغّل تحديث قاعدة البيانات الأساسي من قبل، يمكنك بدلًا من ذلك تشغيل النسخة المحدثة من:

```text
RUN_ONCE_SAFE_DATABASE_UPGRADE.sql
```

لا تشغّل `database.sql` على قاعدة البيانات القديمة؛ هذا الملف مخصص فقط لقاعدة جديدة وفارغة.

## 2) المميزات الجديدة

- داخل رابط Coordinator يوجد تبويبان:
  - Schedule & availability
  - Student feedback
- كل خانة في الجدول توضح بوضوح:
  - Busy بسبب جلسة طالب.
  - Busy لأن المدرس أغلق الوقت.
  - Available إذا كان الوقت مفتوحًا وفارغًا.
- يوم اليوم مميز داخل الجدول.
- قسم `Available time in week` يعرض الأوقات الفارغة لكل يوم وعددها، بنفس أسلوب الصورة المرجعية.
- Coordinator يستطيع فلترة Feedback حسب الطالب وقراءة كل التفاصيل والدرجات.
- زر Download PDF داخل Feedback أصبح ينزّل PDF مباشرة بدون فتح نافذة جديدة وبدون رسالة Allow pop-ups.
- يوجد تنزيل PDF أيضًا داخل صفحة Feedback في رابط Coordinator.
- استبدال الشعار القديم بالشعار الجديد، مع نسخة PNG عالية الدقة 1024×1024 وخلفية خارجية شفافة.
- تحميل خط Manrope الحقيقي لتحسين وضوح النصوص.

## 3) رفع التحديث إلى GitHub وVercel

1. فك ضغط ملف ZIP.
2. ارفع كل الملفات الموجودة داخل المجلد إلى جذر GitHub repository القديم.
3. وافق على استبدال الملفات القديمة.
4. اعمل Commit على فرع `main`.
5. Vercel سيبدأ Deployment جديدًا تلقائيًا.

يجب أن تكون الملفات التالية مباشرة في جذر GitHub:

```text
package.json
index.html
vercel.json
src/
public/
RUN_ONCE_COORDINATOR_FEATURES_UPGRADE.sql
```

إعدادات Vercel:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Root Directory: ./
```

## 4) ملاحظة مهمة عن قاعدة البيانات

رفع ملفات React إلى GitHub لا يرفع قاعدة البيانات. البيانات تظل في Supabase القديم، والمشروع يقرأها من إعدادات `public/config.js` نفسها.
