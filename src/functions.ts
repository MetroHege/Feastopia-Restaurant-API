import {DailyMenu, WeeklyMenu} from './interfaces/Menu';

const fetchData = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error ${response.status} occured`);
  }
  const json = response.json();
  return json;
};

const isDailyMenu = (menu: DailyMenu | WeeklyMenu): menu is DailyMenu =>
  (menu as DailyMenu).courses !== undefined;

export {fetchData, isDailyMenu};
