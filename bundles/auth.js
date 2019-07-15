import { createSelector } from "redux-bundler";

import getAction from "../actions";
import { getItem, setItem, removeItem } from "../services/localstorage";

const TOKEN_KEY = "token";

const TOKEN_UPDATED = getAction("TOKEN_UPDATED");
const FETCH_CURRENT_USER_STARTED = getAction("FETCH_CURRENT_USER_STARTED");
const FETCH_CURRENT_USER_FAILED = getAction("FETCH_CURRENT_USER_FAILED");
const FETCH_CURRENT_USER_SUCCEEDED = getAction("FETCH_CURRENT_USER_SUCCEEDED");
const SIGNOUT_SUCCEEDED = getAction("SIGNOUT_SUCCEEDED");

export default {
    name: "auth",

    getReducer: () => {
        let initialState = {
            email: null,
            username: null,
            image: null,
            token: getItem(TOKEN_KEY) || null,
            bio: null,
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
                    image: payload.image,
                    bio: payload.bio
                };
            } else if (type === FETCH_CURRENT_USER_FAILED) {
                return {
                    ...state,
                    loading: false
                };
            } else if (type === SIGNOUT_SUCCEEDED) {
                return {
                    ...state,
                    token: null,
                    username: null,
                    email: null,
                    image: null,
                    bio: null
                };
            }
            return state;
        };
    },

    doUpdateToken: token => ({ dispatch }) => {
        setItem(TOKEN_KEY, token);

        dispatch({ type: TOKEN_UPDATED, payload: token });
    },

    doSignOut: () => ({ dispatch, store }) => {
        removeItem(TOKEN_KEY);

        dispatch({ type: SIGNOUT_SUCCEEDED });

        store.doUpdateUrl("/");
    },

    doFetchCurrentUser: token => ({ dispatch, apiEndpoint, fetchWrapper }) => {
        dispatch({ type: FETCH_CURRENT_USER_STARTED });
        fetchWrapper
            .get(`${apiEndpoint}/user`, {
                authToken: token
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
    selectUserBio: state => state.auth.bio,
    selectUserEmail: state => state.auth.email,
    selectIsLoadingCurrentUser: state => state.auth.loading,

    selectIsSignedIn: createSelector(
        "selectAuthToken",
        authToken => {
            return authToken;
        }
    ),

    reactShouldFetchUser: createSelector(
        "selectIsLoadingCurrentUser",
        "selectAuthToken",
        "selectUsername",
        (isLoadingCurrentUser, token, username) => {
            if (!isLoadingCurrentUser && token && !username) {
                return { actionCreator: "doFetchCurrentUser", args: [token] };
            }
        }
    )
};
