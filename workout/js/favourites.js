/* Starred movements, so the ones you actually use are one filter away. */

const KEY = 'kb.favourites';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('favourites read failed', e);
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('favourites write failed', e);
  }
}

export const getFavourites = () => read();

export const isFavourite = (exerciseId) => read().includes(exerciseId);

export function toggleFavourite(exerciseId) {
  const list = read();
  const i = list.indexOf(exerciseId);
  if (i === -1) list.push(exerciseId);
  else list.splice(i, 1);
  write(list);
  return i === -1;
}

export function replaceFavourites(list) {
  write(Array.isArray(list) ? list : []);
}
