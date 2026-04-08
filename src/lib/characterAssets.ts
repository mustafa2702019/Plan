const AYANOKOJI_KEY = 'hybrid-system-character-ayanokoji';
const JINWOO_KEY = 'hybrid-system-character-jinwoo';
const DEFAULT_AYANOKOJI = '/ayanokoji-real.jpg';
const DEFAULT_JINWOO = '/jinwoo-real.jpg';

export function getCharacterAssets() {
  return {
    ayanokoji: localStorage.getItem(AYANOKOJI_KEY) || DEFAULT_AYANOKOJI,
    jinwoo: localStorage.getItem(JINWOO_KEY) || DEFAULT_JINWOO,
  };
}

export function setCharacterAsset(type: 'ayanokoji' | 'jinwoo', dataUrl: string) {
  const key = type === 'ayanokoji' ? AYANOKOJI_KEY : JINWOO_KEY;
  localStorage.setItem(key, dataUrl);
}
