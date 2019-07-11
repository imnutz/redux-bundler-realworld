const defaultHeaders = {
    "Content-Type": "application/json"
};

const getHeaders = token => {
    let headers = defaultHeaders;

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    return headers;
};

const resolver = response => {
    return response.ok ? response.json() : Promise.reject(response);
};

const _fetch = (url, method, data) => {
    const { body = "", authToken } = data;
    let options = {
        method,
        headers: getHeaders(authToken)
    };

    if (method !== "GET" && method !== "HEAD") {
        options.body = body;
    }

    return window.fetch(url, options).then(resolver);
};

export default {
    post(url, { body = "", authToken }) {
        return _fetch(url, "POST", { body, authToken });
    },

    get(url, { authToken }) {
        return _fetch(url, "GET", { authToken });
    },

    delete(url, { body = "", authToken }) {
        return _fetch(url, "DELETE", { body, authToken });
    }
};
