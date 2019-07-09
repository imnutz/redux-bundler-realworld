import { createSelector } from "redux-bundler";

import getAction from "../actions";

const SIGNUP_SET_EMAIL = getAction("SIGNUP_SET_EMAIL");
const SIGNUP_SET_NAME = getAction("SIGNUP_SET_NAME");
const SIGNUP_SET_PASSWORD = getAction("SIGNUP_SET_PASSWORD");
const SIGNUP_STARTED = getAction("SIGNUP_STARTED");
const SIGNUP_FAILED = getAction("SIGNUP_FAILED");
const SIGNUP_SUCCEEDED = getAction("SIGNUP_SUCCEEDED");

export default {
    name: "signup",

    getReducer: () => {
        let initialState = {
            email: null,
            name: null,
            password: null,
            error: false,
            errorDetails: null,
            loading: false,
            succeeded: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === SIGNUP_SET_EMAIL) {
                return {
                    ...state,
                    email: payload
                };
            } else if (type === SIGNUP_SET_NAME) {
                return {
                    ...state,
                    name: payload
                };
            } else if (type === SIGNUP_SET_PASSWORD) {
                return {
                    ...state,
                    password: payload
                };
            } else if (type === SIGNUP_STARTED) {
                return {
                    ...state,
                    loading: true,
                    succeeded: false
                };
            } else if (type === SIGNUP_FAILED) {
                return {
                    ...state,
                    loading: false,
                    succeeded: false,
                    error: true,
                    errorDetails: payload
                };
            } else if (type === SIGNUP_SUCCEEDED) {
                return {
                    ...state,
                    loading: false,
                    succeeded: true
                };
            }

            return state;
        };
    },

    doUpdateEmail: email => ({ dispatch }) => {
        dispatch({ type: SIGNUP_SET_EMAIL, payload: email });
    },

    doUpdateName: name => ({ dispatch }) => {
        dispatch({ type: SIGNUP_SET_NAME, payload: name });
    },

    doUpdatePassword: password => ({ dispatch }) => {
        dispatch({ type: SIGNUP_SET_PASSWORD, payload: password });
    },

    doSignup: evt => ({ dispatch, apiEndpoint, store }) => {
        evt.preventDefault();

        dispatch({ type: SIGNUP_STARTED });

        const username = store.selectSignupName();
        const email = store.selectSignupEmail();
        const password = store.selectSignupPassword();

        window
            .fetch(`${apiEndpoint}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: { username, email, password } })
            })
            .then(response => response.json())
            .then(json => {
                if (json.errors) {
                    dispatch({ type: SIGNUP_FAILED, payload: json.errors });
                } else {
                    dispatch({ type: SIGNUP_SUCCEEDED });
                }
            })
            .catch(e => {
                dispatch({ type: SIGNUP_FAILED });
            });
    },

    selectHasSignupValues: createSelector(
        "selectSignupEmail",
        "selectSignupName",
        "selectSignupPassword",
        (signupEmail, signupName, signupPassword) => {
            return signupEmail && signupName && signupPassword;
        }
    ),

    selectSignupName: state => state.signup.name,
    selectSignupEmail: state => state.signup.email,
    selectSignupPassword: state => state.signup.password,
    selectHasError: state => state.signup.error,
    selectErrorDetails: state => state.signup.errorDetails,
    selectIsRegSucceeded: state => state.signup.succeeded,
    selectIsRegInProgress: state => {
        return state.signup.loading;
    },

    reactGoHomeFromSignup: createSelector(
        "selectIsRegInProgress",
        "selectIsRegSucceeded",
        (isRegInProgress, isRegSucceeded) => {
            if (!isRegInProgress && isRegSucceeded) {
                return { actionCreator: "doUpdateUrl", args: ["/"] };
            }
        }
    )
};
