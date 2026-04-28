import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '..', 'public', '_locales');
const locales = fs.readdirSync(localesDir);

const newKeys = {
  confirm_url_label: 'Download URL',
  confirm_url_placeholder: 'Enter download URL',
  confirm_headers_label: 'Request Headers',
  confirm_headers_placeholder: 'One header per line, format: Header-Name: value',
};

const zhTranslations = {
  confirm_url_label: '下载链接',
  confirm_url_placeholder: '输入下载链接',
  confirm_headers_label: '请求头',
  confirm_headers_placeholder: '每行一个header，格式: Header-Name: value',
};

const zhTWTranslations = {
  confirm_url_label: '下載連結',
  confirm_url_placeholder: '輸入下載連結',
  confirm_headers_label: '請求標頭',
  confirm_headers_placeholder: '每行一個header，格式: Header-Name: value',
};

const jaTranslations = {
  confirm_url_label: 'ダウンロードURL',
  confirm_url_placeholder: 'ダウンロードURLを入力',
  confirm_headers_label: 'リクエストヘッダー',
  confirm_headers_placeholder: '1行に1つのヘッダー、形式: Header-Name: value',
};

const koTranslations = {
  confirm_url_label: '다운로드 URL',
  confirm_url_placeholder: '다운로드 URL 입력',
  confirm_headers_label: '요청 헤더',
  confirm_headers_placeholder: '한 줄에 하나의 헤더, 형식: Header-Name: value',
};

const ruTranslations = {
  confirm_url_label: 'URL загрузки',
  confirm_url_placeholder: 'Введите URL загрузки',
  confirm_headers_label: 'Заголовки запроса',
  confirm_headers_placeholder: 'Один заголовок на строку, формат: Header-Name: value',
};

const frTranslations = {
  confirm_url_label: 'URL de téléchargement',
  confirm_url_placeholder: "Entrez l'URL de téléchargement",
  confirm_headers_label: 'En-têtes de requête',
  confirm_headers_placeholder: 'Un en-tête par ligne, format: Header-Name: value',
};

const deTranslations = {
  confirm_url_label: 'Download-URL',
  confirm_url_placeholder: 'Download-URL eingeben',
  confirm_headers_label: 'Anfrage-Header',
  confirm_headers_placeholder: 'Ein Header pro Zeile, Format: Header-Name: value',
};

const esTranslations = {
  confirm_url_label: 'URL de descarga',
  confirm_url_placeholder: 'Ingrese la URL de descarga',
  confirm_headers_label: 'Encabezados de solicitud',
  confirm_headers_placeholder: 'Un encabezado por línea, formato: Header-Name: value',
};

const ptBRTranslations = {
  confirm_url_label: 'URL de download',
  confirm_url_placeholder: 'Digite a URL de download',
  confirm_headers_label: 'Cabeçalhos de requisição',
  confirm_headers_placeholder: 'Um cabeçalho por linha, formato: Header-Name: value',
};

const itTranslations = {
  confirm_url_label: 'URL di download',
  confirm_url_placeholder: 'Inserisci URL di download',
  confirm_headers_label: 'Intestazioni di richiesta',
  confirm_headers_placeholder: "Un'intestazione per riga, formato: Header-Name: value",
};

const nlTranslations = {
  confirm_url_label: 'Download-URL',
  confirm_url_placeholder: 'Voer download-URL in',
  confirm_headers_label: 'Aanvraagheaders',
  confirm_headers_placeholder: 'Eén header per regel, formaat: Header-Name: value',
};

const plTranslations = {
  confirm_url_label: 'URL pobierania',
  confirm_url_placeholder: 'Wprowadź URL pobierania',
  confirm_headers_label: 'Nagłówki żądania',
  confirm_headers_placeholder: 'Jeden nagłówek na linię, format: Header-Name: value',
};

const trTranslations = {
  confirm_url_label: "İndirme URL'si",
  confirm_url_placeholder: "İndirme URL'sini girin",
  confirm_headers_label: 'İstek üstbilgileri',
  confirm_headers_placeholder: 'Her satıra bir üstbilgi, biçim: Header-Name: value',
};

const viTranslations = {
  confirm_url_label: 'URL tải xuống',
  confirm_url_placeholder: 'Nhập URL tải xuống',
  confirm_headers_label: 'Tiêu đề yêu cầu',
  confirm_headers_placeholder: 'Một tiêu đề mỗi dòng, định dạng: Header-Name: value',
};

const thTranslations = {
  confirm_url_label: 'URL ดาวน์โหลด',
  confirm_url_placeholder: 'ป้อน URL ดาวน์โหลด',
  confirm_headers_label: 'ส่วนหัวคำขอ',
  confirm_headers_placeholder: 'หนึ่งส่วนหัวต่อบรรทัด, รูปแบบ: Header-Name: value',
};

const idTranslations = {
  confirm_url_label: 'URL unduhan',
  confirm_url_placeholder: 'Masukkan URL unduhan',
  confirm_headers_label: 'Header permintaan',
  confirm_headers_placeholder: 'Satu header per baris, format: Header-Name: value',
};

const huTranslations = {
  confirm_url_label: 'Letöltési URL',
  confirm_url_placeholder: 'Adja meg a letöltési URL-t',
  confirm_headers_label: 'Kérésfejlécek',
  confirm_headers_placeholder: 'Egy fejléc soronként, formátum: Header-Name: value',
};

const ukTranslations = {
  confirm_url_label: 'URL завантаження',
  confirm_url_placeholder: 'Введіть URL завантаження',
  confirm_headers_label: 'Заголовки запиту',
  confirm_headers_placeholder: 'Один заголовок на рядок, формат: Header-Name: value',
};

const roTranslations = {
  confirm_url_label: 'URL descărcare',
  confirm_url_placeholder: 'Introduceți URL-ul de descărcare',
  confirm_headers_label: 'Antete solicitare',
  confirm_headers_placeholder: 'Un antet pe linie, format: Header-Name: value',
};

const elTranslations = {
  confirm_url_label: 'URL λήψης',
  confirm_url_placeholder: 'Εισάγετε το URL λήψης',
  confirm_headers_label: 'Κεφαλίδες αιτήματος',
  confirm_headers_placeholder: 'Μία κεφαλίδα ανά γραμμή, μορφή: Header-Name: value',
};

const bgTranslations = {
  confirm_url_label: 'URL за изтегляне',
  confirm_url_placeholder: 'Въведете URL за изтегляне',
  confirm_headers_label: 'Заглавки на заявката',
  confirm_headers_placeholder: 'Една заглавка на ред, формат: Header-Name: value',
};

const caTranslations = {
  confirm_url_label: 'URL de descàrrega',
  confirm_url_placeholder: "Introduïu l'URL de descàrrega",
  confirm_headers_label: 'Capçaleres de sol·licitud',
  confirm_headers_placeholder: 'Una capçalera per línia, format: Header-Name: value',
};

const faTranslations = {
  confirm_url_label: 'URL دانلود',
  confirm_url_placeholder: 'URL دانلود را وارد کنید',
  confirm_headers_label: 'هدرهای درخواست',
  confirm_headers_placeholder: 'یک هدر در هر خط، فرمت: Header-Name: value',
};

const arTranslations = {
  confirm_url_label: 'رابط التحميل',
  confirm_url_placeholder: 'أدخل رابط التحميل',
  confirm_headers_label: 'رؤوس الطلب',
  confirm_headers_placeholder: 'رأس واحد في كل سطر، التنسيق: Header-Name: value',
};

const nbTranslations = {
  confirm_url_label: 'Nedlastings-URL',
  confirm_url_placeholder: 'Skriv inn nedlastings-URL',
  confirm_headers_label: 'Forespørselsheadere',
  confirm_headers_placeholder: 'Én header per linje, format: Header-Name: value',
};

const localeTranslations = {
  zh_CN: zhTranslations,
  zh_TW: zhTWTranslations,
  ja: jaTranslations,
  ko: koTranslations,
  ru: ruTranslations,
  fr: frTranslations,
  de: deTranslations,
  es: esTranslations,
  pt_BR: ptBRTranslations,
  it: itTranslations,
  nl: nlTranslations,
  pl: plTranslations,
  tr: trTranslations,
  vi: viTranslations,
  th: thTranslations,
  id: idTranslations,
  hu: huTranslations,
  uk: ukTranslations,
  ro: roTranslations,
  el: elTranslations,
  bg: bgTranslations,
  ca: caTranslations,
  fa: faTranslations,
  ar: arTranslations,
  nb: nbTranslations,
};

locales.forEach((locale) => {
  const filePath = path.join(localesDir, locale, 'messages.json');
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const localeTrans = localeTranslations[locale];
  Object.entries(newKeys).forEach(([key, defaultValue]) => {
    if (!content[key]) {
      const message = localeTrans ? localeTrans[key] : defaultValue;
      content[key] = {
        message,
        description: `Confirm popup: ${key}`,
      };
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log(`Updated ${locale}`);
});

console.log('Done!');
