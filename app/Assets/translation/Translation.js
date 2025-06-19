import LocalizedStrings from 'react-native-localization';
import {Translation_en} from './Translation_en';
import {Translation_zh_hant} from './Translation_zh_hant';
import {Translation_vi} from './Translation_vi';
import {Translation_kr} from './Translation_kr';
import {Translation_th} from './Translation_th';
import {Translation_kh} from './Translation_KH';

export const translationString = new LocalizedStrings({
  'zh-Hant': Translation_zh_hant,
  en: Translation_en,
  vi: Translation_vi,
  kr: Translation_kr,
  th: Translation_th,
  km: Translation_kh,
  km_KH: Translation_kh,
});
