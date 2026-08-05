import { Program } from '../types';

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    title: 'یادگیری زبان انگلیسی',
    description: 'برنامه جامع برای رسیدن به سطح آیلتس ۶.۵ تا پایان سال',
    createdAt: new Date('2026-01-01').toISOString(),
    paths: [
      {
        id: 'path-1',
        title: 'مهارت خواندن و نوشتن (Reading & Writing)',
        description: 'تمرکز بر گرامر و دایره لغات',
        color: 'indigo',
        nodes: [
          {
            id: 'node-1-1',
            title: 'مرور گرامر پایه',
            description: 'یادگیری زمان‌ها و ساختارهای اصلی',
            status: 'IN_PROGRESS',
            parentId: null,
            createdAt: new Date('2026-01-05').toISOString(),
            checklist: [
              { id: 'chk-1', text: 'زمان حال و گذشته', completed: true },
              { id: 'chk-2', text: 'زمان آینده و مجهول', completed: false },
            ]
          },
          {
            id: 'node-1-2',
            title: 'خواندن مقالات کوتاه',
            description: 'مطالعه روزانه یک خبر کوتاه انگلیسی',
            status: 'NOT_STARTED',
            parentId: null,
            createdAt: new Date('2026-01-10').toISOString(),
            checklist: [
              { id: 'chk-3', text: 'پیدا کردن سایت‌های خبری مناسب', completed: false },
              { id: 'chk-4', text: 'خلاصه‌نویسی اخبار', completed: false }
            ]
          }
        ]
      },
      {
        id: 'path-2',
        title: 'مهارت شنیداری و گفتاری (Listening & Speaking)',
        description: 'تقویت مکالمه و فهمیدن پادکست‌ها',
        color: 'emerald',
        nodes: [
          {
            id: 'node-2-1',
            title: 'گوش دادن به پادکست',
            description: 'روزی ۲۰ دقیقه پادکست ESL',
            status: 'IN_PROGRESS',
            parentId: null,
            createdAt: new Date('2026-01-05').toISOString(),
            checklist: [
              { id: 'chk-5', text: 'دانلود اپلیکیشن پادکست', completed: true },
              { id: 'chk-6', text: 'گوش دادن در مسیر رفت‌و‌آمد', completed: false },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'prog-2',
    title: 'تناسب اندام و سلامتی',
    description: 'کاهش وزن و افزایش قدرت بدنی در ۶ ماه',
    createdAt: new Date('2026-02-10').toISOString(),
    paths: [
      {
        id: 'path-3',
        title: 'ورزش مستمر',
        description: 'بدنسازی و هوازی',
        color: 'amber',
        nodes: [
          {
            id: 'node-3-1',
            title: 'ثبت‌نام در باشگاه',
            description: 'پیدا کردن باشگاه نزدیک خانه',
            status: 'COMPLETED',
            parentId: null,
            createdAt: new Date('2026-02-12').toISOString(),
            checklist: [
              { id: 'chk-7', text: 'بررسی باشگاه‌های اطراف', completed: true },
              { id: 'chk-8', text: 'تهیه لباس ورزشی', completed: true }
            ]
          },
          {
            id: 'node-3-2',
            title: 'تمرینات هوازی',
            description: 'هفته‌ای ۳ روز دویدن روی تردمیل',
            status: 'IN_PROGRESS',
            parentId: null,
            createdAt: new Date('2026-02-20').toISOString(),
            checklist: [
              { id: 'chk-9', text: 'افزایش سرعت دویدن', completed: false }
            ]
          }
        ]
      }
    ]
  }
];
