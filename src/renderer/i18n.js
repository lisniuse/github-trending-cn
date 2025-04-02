import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTranslation from './locales/zh.json';
import enTranslation from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zhTranslation  // 修改这里，直接使用 common 对象
      },
      en: {
        translation: enTranslation  // 修改这里，直接使用 common 对象
      }
    },
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;