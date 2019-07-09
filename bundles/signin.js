import { createSelector } from "redux-bundler";

import getAction from "../actions";
import { setItem } from "../services/localstorage";

const SIGNIN_SET_EMAIL = getAction("SIGNIN_SET_EMAIL");
const SIGNIN_SET_PASSWORD = getAction("SIGNIN_SET_PASSWORD");
const SIGNIN_STARTED = getAction("SIGNIN_STARTED");
const SIGNIN_FAILED = getAction("SIGNIN_FAILED");
const SIGNIN_SUCCEEDED = getAction("SIGNIN_SUCCEEDED");

export default {
    name: "signin",

    getReducer: () => {
        let initialState = {
            email: null,
            password: null,
            loading: false,
            error: false,
            errorDetails: null,
            succeeded: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === SIGNIN_SET_EMAIL) {
                return {
                    ...state,
                    email: payload
                };
            } else if (type === SIGNIN_SET_PASSWORD) {
                return {
                    ...state,
                    password: payload
                };
            } else if (type === SIGNIN_STARTED) {
                return {
                    ...state,
                    loading: true
                };
            } else if (type === SIGNIN_FAILED) {
                return {
                    ...state,
                    loading: false,
                    error: true,
                    errorDetails: payload
                };
            } else if (type === SIGNIN_SUCCEEDED) {
                return {
                    ...state,
                    loading: false,
                    error: false,
                    succeeded: true
                };
            }

            return state;
        };
    },

    doUpdateSigninEmail: email => ({ dispatch }) => {
        dispatch({ type: SIGNIN_SET_EMAIL, payload: email });
    },

    doUpdateSigninPassword: password => ({ dispatch }) => {
        dispatch({ type: SIGNIN_SET_PASSWORD, payload: password });
    },

    doSignIn: evt => ({ dispatch, apiEndpoint, store }) => {
        evt.preventDefault();

        const email = store.selectSigninEmail();
        const password = store.selectSigninPassword();

        dispatch({ type: SIGNIN_STARTED });
        window
            .fetch(`${apiEndpoint}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: { email, password }
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.errors) {
                    dispatch({ type: SIGNIN_FAILED, payload: json.errors });
                } else {
                    const {
                        token
                    } = json.user;

                    store.doUpdateToken(token);

                    dispatch({ type: SIGNIN_SUCCEEDED, payload: json.user });
                }
            })
            .catch(e => dispatch({ type: SIGNIN_FAILED }));
    },

    selectSigninEmail: state => state.signin.email,
    selectSigninPassword: state => state.signin.password,
    selectIsAuthInProgress: state => state.signin.loading,
    selectIsAuthSucceeded: state => state.signin.succeeded,

    selectHasSigninValues: createSelector(
        "selectSigninEmail",
        "selectSigninPassword",
        (email, password) => {
            return email && password;
        }
    ),

    reactGoHomeFromSignin: createSelector(
        "selectIsAuthInProgress",
        "selectIsAuthSucceeded",
        (isAuthInProgress, isAuthSucceeded) => {
            if (!isAuthInProgress && isAuthSucceeded) {
                return { actionCreator: "doUpdateUrl", args: ["/"] };
            }
        }
    )
};
