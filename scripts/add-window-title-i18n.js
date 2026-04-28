import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '..', 'public', '_locales');
const locales = fs.readdirSync(localesDir);

const newKey = 'confirm_window_title';

const translations = {
  zh_CN: '发送到 Aria2',
  zh_TW: '發送到 Aria2',
  ja: 'Aria2 に送信',
  ko: 'Aria2로 보내기',
  ru: 'Отправить в Aria2',
  fr: 'Envoyer à Aria2',
  de: 'An Aria2 senden',
  es: 'Enviar a Aria2',
  pt_BR: 'Enviar para Aria2',
  it: 'Invia a Aria2',
  nl: 'Verzenden naar Aria2',
  pl: 'Wyślij do Aria2',
  tr: "Aria2'ye gönder",
  vi: 'Gửi đến Aria2',
  th: 'ส่งไปยัง Aria2',
  id: 'Kirim ke Aria2',
  hu: 'Küldés az Aria2-be',
  uk: 'Надіслати до Aria2',
  ro: 'Trimite către Aria2',
  el: 'Αποστολή στο Aria2',
  bg: 'Изпрати до Aria2',
  ca: 'Enviar a Aria2',
  fa: 'ارسال به Aria2',
  ar: 'إرسال إلى Aria2',
  nb: 'Send til Aria2',
};

locales.forEach((locale) => {
  const filePath = path.join(localesDir, locale, 'messages.json');
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!content[newKey]) {
    content[newKey] = {
      message: translations[locale] || 'Confirm Download',
      description: 'Title of the download confirmation popup window',
    };
  }

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log(`Updated ${locale}`);
});

console.log('Done!');
