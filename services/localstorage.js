export const setItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error(e);
    }
};

export const getItem = key => {
    let result;

    try {
        result = localStorage.getItem(key);
    } catch (e) {
        console.error(e);
    }

    return result;
};

export const removeItem = key => {
    localStorage.removeItem(key);
};
