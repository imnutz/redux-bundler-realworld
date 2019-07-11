const API_ENDPOINT = "https://conduit.productionready.io/api";

import fetchWrapper from "../services/fetchWrapper";

export default {
    name: "extraArgs",
    getExtraArgs: () => {
        return {
            apiEndpoint: API_ENDPOINT,
            fetchWrapper
        };
    }
};
