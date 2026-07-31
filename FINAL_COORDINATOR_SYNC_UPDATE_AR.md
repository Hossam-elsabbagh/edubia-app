# تحديث Coordinator النهائي

## ما تم إصلاحه

- جدول Coordinator أصبح يستخدم نفس بيانات الجلسات والأوقات المغلقة الموجودة في Dashboard.
- تصميم الجدول وحالات Paid / Cover / Free وAvailable / Unavailable متطابقة مع Dashboard.
- Coordinator للعرض فقط: لا توجد أزرار لتعديل جلسة أو تغيير حالة الوقت.
- Feedback يظهر داخل تبويب Student feedback مع فلترة حسب الطالب.
- تنزيل Feedback بصيغتي PDF وJSON مباشرة من Coordinator.
- إضافة عبارة `Developed by Hossam` بخط صغير جدًا أسفل يمين كل صفحة، بما فيها صفحة Coordinator وتسجيل الدخول.

## الخطوة المطلوبة في Supabase

شغّل الملف التالي مرة واحدة فقط في نفس مشروع Supabase القديم:

`RUN_ONCE_COORDINATOR_SYNC_FIX.sql`

من:

Supabase Dashboard → SQL Editor → New query → Run

الملف لا يحذف الطلاب أو الجلسات أو Feedback. يقوم فقط بتوحيد ملكية البيانات القديمة وإضافة دالة قراءة موحدة لصفحة Coordinator.

## رفع المشروع

1. فك ضغط ملف ZIP.
2. ارفع الملفات الموجودة داخله إلى جذر GitHub repository القديم.
3. استبدل الملفات السابقة واعمل Commit على فرع `main`.
4. انتظر Vercel حتى ينتهي من Deployment.
5. شغّل ملف SQL السابق مرة واحدة، ثم افتح Coordinator link واضغط Ctrl + F5.
