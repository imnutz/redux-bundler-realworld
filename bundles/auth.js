import { createSelector } from "redux-bundler";

import getAction from "../actions";
import { getItem, setItem } from "../services/localstorage";

const TOKEN_UPDATED = getAction("TOKEN_UPDATED");
const FETCH_CURRENT_USER_STARTED = getAction("FETCH_CURRENT_USER_STARTED");
const FETCH_CURRENT_USER_FAILED = getAction("FETCH_CURRENT_USER_FAILED");
const FETCH_CURRENT_USER_SUCCEEDED = getAction("FETCH_CURRENT_USER_SUCCEEDED");

export default {
    name: "auth",

    getReducer: () => {
        let initialState = {
            email: null,
            username: null,
            image: null,
            token: getItem("token") || null,
            loading: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === TOKEN_UPDATED) {
                return {
                    ...state,
                    token: payload
                };
            } else if (type === FETCH_CURRENT_USER_STARTED) {
                return {
                    ...state,
                    loading: true
                };
            } else if (type === FETCH_CURRENT_USER_SUCCEEDED) {
                return {
                    ...state,
                    loading: false,
                    email: payload.email,
                    username: payload.username,
                    image: payload.image
                };
            } else if (type === FETCH_CURRENT_USER_FAILED) {
                return {
                    ...state,
                    loading: false
                };
            }
            return state;
        };
    },

    doUpdateToken: token => ({ dispatch }) => {
        setItem("token", token);

        dispatch({ type: TOKEN_UPDATED, payload: token });
    },

    doFetchCurrentUser: token => ({ dispatch, apiEndpoint }) => {
        dispatch({ type: FETCH_CURRENT_USER_STARTED });
        window
            .fetch(`${apiEndpoint}/user`, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    dispatch({ FETCH_CURRENT_USER_FAILED });
                }

                return response.json();
            })
            .then(json => {
                dispatch({
                    type: FETCH_CURRENT_USER_SUCCEEDED,
                    payload: json.user
                });
            })
            .catch(e => dispatch({ type: FETCH_CURRENT_USER_FAILED }));
    },

    selectIsAuthorized: state => Boolean(state.auth.token),
    selectAuthToken: state => state.auth.token,
    selectUsername: state => state.auth.username,
    selectUserImage: state => state.auth.image,
    selectIsLoading: state => state.auth.loading,

    reactShouldFetchUser: createSelector(
        "selectIsLoading",
        "selectAuthToken",
        "selectUsername",
        (isLoading, token, username) => {
            if (!isLoading && token && !username) {
                return { actionCreator: "doFetchCurrentUser", args: [token] };
            }
        }
    )
};
