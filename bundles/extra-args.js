const API_ENDPOINT = "https://conduit.productionready.io/api";

export default {
    name: "extraArgs",
    getExtraArgs: () => {
        return {
            apiEndpoint: API_ENDPOINT
        };
    }
};
