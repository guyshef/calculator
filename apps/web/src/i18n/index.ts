import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const he = {
  translation: {
    lobby: {
      title: 'מתמטיקה מהנה!',
      addChild: '+ הוסף ילד',
      parentArea: 'אזור הורים 🔒',
    },
    avatarSelect: {
      title: 'בחר את הגיבור שלך',
      namePlaceholder: 'מה שמך?',
      start: 'בואו נתחיל! ▶',
    },
    map: {
      title: 'המסע שלך',
      level: 'שלב',
    },
    exercise: {
      question: 'כמה זה?',
      replay: '🔊 שמע שוב',
      tryAgain: 'נסה שוב',
      fixAnswer: 'תקן תשובה',
    },
    results: {
      complete: 'כל הכבוד! 🎉',
      coinsEarned: 'הרווחת',
      coins: 'מטבעות',
      playAgain: 'שחק שוב',
      nextLevel: 'שלב הבא ▶',
    },
    parent: {
      title: 'אזור הורים',
      email: 'אימייל',
      password: 'סיסמה',
      login: 'כניסה',
      forgot: 'שכחתי סיסמה',
      dashboard: 'לוח בקרה',
      child: 'ילד',
      progressChart: 'התקדמות 30 ימים אחרונים',
      errorChart: 'שגיאות לפי נושא',
      weeklyTime: 'זמן השבוע',
      minutes: 'דקות',
      weakAreas: 'תחומים לחיזוק',
    },
    avatar: {
      'cat-1': 'חתול כחול',
      'cat-2': 'חתול כתום',
      'hero-1': 'גיבור על ירוק',
      'hero-2': 'גיבור על סגול',
    },
  },
};

i18n.use(initReactI18next).init({
  resources: { he },
  lng: 'he',
  fallbackLng: 'he',
  interpolation: { escapeValue: false },
});

export default i18n;
