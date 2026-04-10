# تعليمات إضافة أيقونات الموقع

## الخطوات المطلوبة:

1. احفظ الصورة التي أرسلتها باسم `icon.png` في مجلد `public`
2. قم بإنشاء نسخ بأحجام مختلفة:
   - `icon.png` - 512x512 بكسل (الأيقونة الرئيسية)
   - `icon-192.png` - 192x192 بكسل (للأجهزة المحمولة)
   - `apple-icon.png` - 180x180 بكسل (لأجهزة Apple)
   - `favicon.ico` - 32x32 و 16x16 بكسل (للمتصفحات القديمة)

## أدوات مفيدة لتحويل الصورة:

### استخدام أدوات أونلاين:
- https://realfavicongenerator.net/ (يولد جميع الأحجام تلقائياً)
- https://favicon.io/ (سهل الاستخدام)

### استخدام ImageMagick (إذا كان مثبتاً):
```bash
# تحويل إلى 512x512
magick convert your-image.png -resize 512x512 public/icon.png

# تحويل إلى 192x192
magick convert your-image.png -resize 192x192 public/icon-192.png

# تحويل إلى 180x180 لـ Apple
magick convert your-image.png -resize 180x180 public/apple-icon.png

# إنشاء favicon.ico
magick convert your-image.png -resize 32x32 public/favicon.ico
```

## ملاحظات:
- تأكد من أن الصورة بخلفية شفافة أو سوداء
- الصيغة PNG مفضلة للجودة العالية
- Next.js سيقوم تلقائياً بإنشاء الأيقونات من ملفات icon.tsx و apple-icon.tsx
