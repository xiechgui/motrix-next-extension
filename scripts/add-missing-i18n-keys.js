import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '..', 'public', '_locales');
const locales = fs.readdirSync(localesDir);

const newKeys = {
  confirm_connected: {
    message: 'Connected',
    description: 'Shown when aria2 is connected',
  },
  confirm_disconnected: {
    message: 'Disconnected',
    description: 'Shown when aria2 is disconnected',
  },
};

// Chinese translations
const zhTranslations = {
  confirm_connected: '已连接',
  confirm_disconnected: '未连接',
};

locales.forEach((locale) => {
  const filePath = path.join(localesDir, locale, 'messages.json');
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  Object.entries(newKeys).forEach(([key, value]) => {
    if (!content[key]) {
      // Use Chinese translation for zh_CN and zh_TW, English for others
      if (locale === 'zh_CN' || locale === 'zh_TW') {
        content[key] = {
          message: zhTranslations[key],
          description: value.description,
        };
      } else {
        content[key] = value;
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log(`Updated ${locale}`);
});

console.log('Done!');
