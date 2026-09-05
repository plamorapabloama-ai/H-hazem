# خطة تنفيذ: نظام حماية وقفل المستخدمين، ضبط المصنع والتصفير الفعلي، استيراد وتصدير البيانات، وأيقونة حضانات الأطفال

تهدف هذه الخطة إلى تلبية كافة المتطلبات المحددة بدقة واحترافية عالية لنظام الموارد البشرية وإدارة الحضانات:
1. **قفل يوزر الأدمن ولكل موظف بباسورد خاص** مع شاشة قفل (Lock Screen) ونافذة تحقق تفاعلية عند تبديل المستخدمين.
2. **ضبط مصنع وتصفير فعلي لكافة البيانات التجريبية** (Zero Demo Data) للبدء المباشر في العمل الحقيقي مع تأكيد أمان.
3. **ميزة إدارة وحذف البيانات** (حذف موظفين، حذف مؤثرات، تنظيف شامل أو انتقائي).
4. **استيراد وتصدير البيانات** (تصدير واستعادة نسخة احتياطية كاملة JSON، تصدير واستيراد الموظفين عبر Excel، وتحميل قالب إكسيل جاهز).
5. **إنشاء وتضمين أيقونة وهوية بصرية احترافية لحضانات الأطفال** (PWA Icons, Vector SVGs, والشعار المعتمد).

---

## User Review Required

> [!IMPORTANT]
> - **كلمة المرور الافتراضية للمدير (Admin):** `admin123` (يمكن تغييرها فوراً من الإعدادات).
> - **كلمة المرور الافتراضية للموظفين الجدد:** `1234` (قابلة للتخصيص من قِبل الأدمن في سجل الموظفين، أو من قِبل الموظف نفسه في ملفه الشخصي).
> - **ضبط المصنع الفعلي:** يمسح جميع الموظفين والطلبات التجريبية ليصبح النظام فارغاً 100% وجاهزاً للتشغيل الحي الفعلي، ويتطلب كتابة كلمة "تصفير" أو إدخال باسورد الأدمن كإجراء وقائي. كما يتوفر خيار منفصل لاستعادة البيانات التجريبية للعرض التوضيحي عند الحاجة.

---

## المكونات والتعديلات المقترحة

### 1. نظام الحماية والأمان وقفل المستخدمين (Admin & Employee Passwords + Lock System)

#### [NEW] [AuthModal.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/common/AuthModal.jsx)
- نافذة منبثقة أنيقة ومؤمنة تظهر تلقائياً عند الرغبة في التبديل إلى حساب المدير (Admin) أو عند اختيار موظف معين.
- إمكانية إظهار / إخفاء الرمز السري (Eye toggle).
- فحص فوري لكلمة المرور مع تنبيه بصري واهتزاز سلس عند الخطأ.

#### [NEW] [LockScreen.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/common/LockScreen.jsx)
- شاشة قفل كاملة تعرض هوية الحضانة / المنشأة، الساعة والوقت المباشر، وحقل PIN / كلمة مرور لفك القفل.
- تتيح للمستخدم أو المدير قفل الشاشة فوراً عند مغادرة الجهاز بضغطة زر واحدة.

#### [MODIFY] [HRContext.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/context/HRContext.jsx)
- إضافة حالة `adminPassword` وحفظها في `localStorage`.
- إضافة خاصية `password` لكل كائن موظف في مصفوفة الموظفين.
- إضافة دوال التحقق: `verifyAdminPassword`, `verifyEmployeePassword`, `updateAdminPassword`, `updateEmployeePassword`.
- إدارة حالة قفل التطبيق `isAppLocked` ودوال `lockApp()` و `unlockApp()`.

#### [MODIFY] [Navbar.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/common/Navbar.jsx)
- إضافة زر قفل الشاشة السريع (Lock button) مع مؤشر حالة الأمان.
- ربط تبديل الدور (مدير / موظف) والـ dropdown بنافذة `AuthModal`.

#### [MODIFY] [EmployeesManager.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/admin/EmployeesManager.jsx)
- إضافة حقل "كلمة المرور / PIN الخاص بالموظف" في نموذج إضافة وتعديل الموظف، مع زر توليد كلمة سر عشوائية وزر إظهار/إخفاء.

#### [MODIFY] [EmployeeProfile.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/employee/EmployeeProfile.jsx)
- إضافة بطاقة أمان تسمح للموظف بتغيير كلمة المرور الخاصة به بعد التحقق من كلمة المرور القديمة.

---

### 2. ضبط المصنع الفعلي والتصفير الشامل وإدارة حذف البيانات

#### [MODIFY] [HRContext.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/context/HRContext.jsx)
- **دالة `factoryReset()`:** تصفير فعلي كامل لجميع مصفوفات الموظفين والمؤثرات (`employees = []`, `effects = []`) ومسح بيانات التخزين المؤقت، مع ترك حساب المدير جاهزاً لتسجيل بيانات الحضانة الفعلية.
- **دالة `clearAllEffects()`:** مسح سجل المؤثرات والطلبات وتصفير أرصدة الشهر فقط.
- **دالة `clearAllEmployees()`:** مسح سجل الموظفين دفعة واحدة.
- **دالة `loadDemoData()`:** استعادة البيانات التجريبية التوضيحية عند الطلب.
- تعزيز دالة `deleteEmployee(id)` لحذف كافة المؤثرات والطلبات المرتبطة بالموظف المحذوف تلقائياً.

#### [NEW] [DataManagementModal.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/admin/DataManagementModal.jsx)
- مركز تحكم متكامل لضبط المصنع وحذف البيانات:
  - تصفير وضبط مصنع فعلي (مع نافذة تأكيد وكتابة كلمة "تصفير" أو كلمة سر الأدمن).
  - حذف انتقائي: حذف كل المؤثرات / حذف كل الموظفين / حذف موظف محدد.
  - تفاصيل حجم البيانات المسجلة حالياً (عدد الموظفين، عدد المؤثرات، حجم الذاكرة).

---

### 3. استيراد وتصدير البيانات (JSON Backup + Excel Import/Export)

#### [NEW] [backupManager.js](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/utils/backupManager.js)
- **تصدير نسخة احتياطية كاملة (JSON Backup):** تشمل الموظفين، المؤثرات، الإعدادات، وكلمات المرور في ملف JSON موثق بتاريخ وتوقيت.
- **استعادة نسخة احتياطية (Restore JSON Backup):** قراءة الملف، فحص بنيته والتأكد من سلامته، ثم تطبيقه وتحديث النظام فوراً.
- **تصدير كشف الموظفين Excel (Export Staff XLSX):** تصدير سجل الموظفين ببياناتهم الكاملة.
- **تحميل قالب إكسيل فارغ للاستيراد (Download Excel Template):** قالب جاهز بالأعمدة العربية المطلوبة لتسهيل إدخال بيانات العاملين بالحضانة دفعة واحدة.
- **استيراد الموظفين من Excel (Import Staff from XLSX):** قراءة ملف الإكسيل وإضافتهم تلقائياً للسجل.

#### [MODIFY] [SettingsManager.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/settings/SettingsManager.jsx)
- إضافة تبويبين جديدين:
  1. **"إدارة ونسخ البيانات"**: استيراد/تصدير، نسخ احتياطي، تحميل قوالب إكسيل، وضبط المصنع والتصفير الفعلي.
  2. **"الأمان وكلمات المرور"**: تغيير باسورد الأدمن، تفعيل/تعطيل القفل التلقائي، وإدارة صلاحيات الدخول.

---

### 4. إنشاء أيقونة وهوية احترافية لحضانات الأطفال (Nursery Daycare Icon & Identity)

#### [NEW] [nursery-icon.svg](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/public/nursery-icon.svg) & [pwa-icon.svg](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/public/pwa-icon.svg)
- تصميم أيقونة فيكتور فائقة الجودة تمثل حضانات الأطفال:
  - رسمة دافئة وطفولية راقية (وجه طفل مبتسم، أيادي حانية، شمس ساطعة، قلب أو نبتة براعم بألوان بهيجة ودافئة).
  - تدرجات لونية عصرية (Emerald & Amber & Sky Blue & Coral).
  - متوافقة تماماً كأيقونة PWA Maskable بمقاسات 192x192 و 512x512 و Favicon.

#### [NEW] أيقونة وصورة مرجعية مولدة بالذكاء الاصطناعي
- توليد وتوفير صورة شعار احترافية ثلاثية الأبعاد لحضانات الأطفال لحفظها واستخدامها في التطبيق والتقارير.

#### [MODIFY] [SettingsManager.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/settings/SettingsManager.jsx) & [Navbar.jsx](file:///C:/Users/warcraft/.gemini/antigravity/scratch/egypt_hr_master/src/components/common/Navbar.jsx)
- إضافة خيار التبديل إلى هوية الحضانة، مع إمكانية تعديل اسم الحضانة وتنزيل الأيقونة بجودات متعددة.

---

### 5. مزامنة التعديلات مع مسار سطح المكتب (Desktop Sync)
- بعد إتمام وبناء التحديثات في مجلد المشروع، مزامنتها تلقائياً مع `C:\Users\warcraft\Desktop\egypt_hr_master` لضمان عمل كلا النسختين بنفس الكفاءة ودون أي تعارض.

---

## خطة التحقق والتوثيق (Verification Plan)

### الاختبارات الوظيفية الآلية واليدوية
1. **اختبار البناء والتشغيل:**
   - تشغيل `npm run build` للتأكد من عدم وجود أية أخطاء في TypeScript أو Vite أو الحزم.
2. **اختبار الأمان وقفل المستخدمين:**
   - قفل الشاشة والتأكد من عدم القدرة على الدخول إلا بالرمز السري.
   - اختبار التبديل إلى دور الأدمن بالباسورد الافتراضي `admin123`.
   - اختبار التبديل إلى حساب موظف بالباسورد الخاص به `1234`.
   - تعديل كلمة مرور موظف والتأكد من حفظها.
3. **اختبار ضبط المصنع والتصفير الفعلي:**
   - إجراء تصفير المصنع والتأكد من مسح جميع السجلات التجريبية وظهور النظام نظيفاً وخالياً.
   - تجربة استعادة البيانات التجريبية للتأكد من عملها الاختياري.
4. **اختبار التصدير والاستيراد:**
   - تصدير نسخة احتياطية JSON وفحص محتواها.
   - تصدير واستيراد ملف Excel للموظفين والتحقق من إضافة السجلات.
5. **اختبار الأيقونة وهوية الحضانة:**
   - فحص الأيقونة في المتصفح والـ PWA Manifest وتأكيد وضوحها وتناسبها مع هوية حضانات الأطفال.
