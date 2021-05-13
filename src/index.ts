import { GameApp } from './app';
import { TestType } from './utils/Enums';
import i18next from 'i18next';
import { translationEN } from './assets/locales/en/translationEN';
import { translationNO } from './assets/locales/no/translationNO';

window.onload = () => {
  // init language handler
  i18next
    .init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: {
          translation: translationEN
        },
        no: {
          translation: translationNO
        }
      }
    }).then(_t => {
      // create test
      if (process.env.TEST_TYPE == "MOTION") {
        document.title = "Magno: Motion Test";
        new GameApp(window.innerWidth, window.innerHeight, TestType.MOTION);
      } else if (process.env.TEST_TYPE == "FORM_FIXED") {
        document.title = "Magno: Form Fixed Test";
        new GameApp(window.innerWidth, window.innerHeight, TestType.FORM_FIXED);
      } else if (process.env.TEST_TYPE == "FORM_RANDOM") {
        document.title = "Magno: Form Random Test";
        new GameApp(window.innerWidth, window.innerHeight, TestType.FORM_RANDOM);
      }
    });
};
