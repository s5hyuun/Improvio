import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// JSON 파일 import
import ko from './i18n/locales/ko.json';
import en from './i18n/locales/en.json';
import ja from './i18n/locales/ja.json';


i18n
  .use(initReactI18next) // React용 초기화
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: "ko", // 초기 언어
    fallbackLng: "ko", // 언어 없을 때 기본
    interpolation: { escapeValue: false },
  });

export default i18n;
