import {
  TextWriter,
  ZipReader,
  HttpReader,
} from 'https://deno.land/x/zipjs@v2.6.50/index.js';
const ASSETS_PATH = 'assets/';
const FILES = [
  'ShortNumberMetadata.xml',
  'PhoneNumberMetadata.xml',
  'PhoneNumberAlternateFormats.xml',
];
const DIRS = ['carrier', 'geocoding'];

function skipParent(path) {
  return path.substring(path.indexOf('/') + 1);
}

const release = await (
  await fetch(
    'https://api.github.com/repos/google/libphonenumber/releases/latest'
  )
).json();
console.info('Found version ' + release.tag_name);
const zipReader = new ZipReader(new HttpReader(release.zipball_url));
const entries = await zipReader.getEntries();

for (const entry of entries) {
  const filename = skipParent(entry.filename);
  for (const file of FILES) {
    if (filename == `resources/${file}`) {
      const full = await entry.getData(new TextWriter());
      await Deno.writeTextFile(ASSETS_PATH + file, full);
    }
  }
  for (const dir of DIRS) {
    if (filename.startsWith(`resources/${dir}/`) && !filename.endsWith('/')) {
      const full = await entry.getData(new TextWriter());
      await Deno.writeTextFile(ASSETS_PATH + skipParent(filename), full);
    }
  }
}
