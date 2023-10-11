const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error ${response.status} occured`);
    }
    const json = response.json();
    return json;
};
const isDailyMenu = (menu) => menu.courses !== undefined;
export { fetchData, isDailyMenu };
