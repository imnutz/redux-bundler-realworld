import { createSelector } from "redux-bundler";

import getAction from "../actions";

const SETTINGS_UPDATE_INFO = getAction("SETTINGS_UPDATE_INFO");
const SETTINGS_UPDATE_AVATAR = getAction("SETTINGS_UPDATE_AVATAR");
const SETTINGS_UPDATE_BIO = getAction("SETTINGS_UPDATE_BIO");
const SETTINGS_UPDATE_USERNAME = getAction("SETTINGS_UPDATE_USERNAME");
const SETTINGS_UPDATE_EMAIL = getAction("SETTINGS_UPDATE_EMAIL");
const SETTINGS_UPDATE_PASSWORD = getAction("SETTINGS_UPDATE_PASSWORD");

export default {
    name: "settings",
    getReducer: () => {
        let initialState = {
            avatarUrl: null,
            username: null,
            bio: null,
            email: null,
            password: null,
            updated: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === SETTINGS_UPDATE_INFO) {
                return {
                    ...state,
                    ...payload,
                    updated: true
                };
            } else if (type === SETTINGS_UPDATE_AVATAR) {
                return {
                    ...state,
                    avatarUrl: payload
                };
            } else if (type === SETTINGS_UPDATE_USERNAME) {
                return {
                    ...state,
                    username: payload
                };
            } else if (type === SETTINGS_UPDATE_BIO) {
                return {
                    ...state,
                    bio: payload
                };
            } else if (type === SETTINGS_UPDATE_EMAIL) {
                return {
                    ...state,
                    email: payload
                };
            } else if (type === SETTINGS_UPDATE_PASSWORD) {
                return {
                    ...state,
                    password: payload
                };
            }

            return state;
        };
    },

    selectAvatarUrl: state => state.settings.avatarUrl,
    selectSettingsUsername: state => state.settings.username,
    selectSettingsBio: state => state.settings.bio,
    selectSettingsEmail: state => state.settings.email,
    selectSettingsPassword: state => state.settings.password,
    selectIsInfoUpdated: state => state.settings.updated,

    doUpdateAvatarUrl: avatarUrl => ({ dispatch }) => {
        dispatch({ type: SETTINGS_UPDATE_AVATAR, payload: avatarUrl });
    },
    doUpdateSettingsUsername: username => ({ dispatch }) => {
        dispatch({ type: SETTINGS_UPDATE_USERNAME, payload: username });
    },
    doUpdateSettingsBio: bio => ({ dispatch }) => {
        dispatch({ type: SETTINGS_UPDATE_BIO, payload: bio });
    },
    doUpdateSettingsEmail: email => ({ dispatch }) => {
        dispatch({ type: SETTINGS_UPDATE_EMAIL, payload: email });
    },
    doUpdateSettingsPassword: password => ({ dispatch }) => {
        dispatch({ type: SETTINGS_UPDATE_PASSWORD, payload: password });
    },

    doUpdateSettings: (data = {}, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper,
        store
    }) => {
        const {
            avatarUrl: image,
            settingsUsername: username,
            settingsBio: bio,
            settingsEmail: email,
            settingsPassword: password
        } = data;

        const requestBody = {
            image,
            username,
            email,
            bio
        };

        if (password) {
            requestBody.password = password;
        }

        fetchWrapper
            .put(`${apiEndpoint}/user`, {
                body: JSON.stringify(requestBody),
                authToken: token
            })
            .then(response => {
                store.doUpdateUrl(`/profile/${response.user.username}`);
            });
    },

    doUpdateSettingsInfo: (username, userImage, userBio, userEmail) => ({
        dispatch
    }) => {
        dispatch({
            type: SETTINGS_UPDATE_INFO,
            payload: {
                username,
                avatarUrl: userImage,
                bio: userBio,
                email: userEmail
            }
        });
    },

    reactShouldFetchOrUpdateUser: createSelector(
        "selectUsername",
        "selectUserImage",
        "selectUserBio",
        "selectUserEmail",
        "selectAuthToken",
        "selectIsInfoUpdated",
        "selectIsLoadingCurrentUser",
        (
            username,
            userImage,
            userBio,
            userEmail,
            authToken,
            isInfoUpdated,
            isLoadingCurrentUser
        ) => {
            if (isLoadingCurrentUser) return;

            if (username && authToken && !isInfoUpdated) {
                return {
                    actionCreator: "doUpdateSettingsInfo",
                    args: [username, userImage, userBio, userEmail]
                };
            } else if (authToken && !isInfoUpdated) {
                return {
                    // auth bundler
                    actionCreator: "doFetchCurrentUser",
                    args: [authToken]
                };
            }
        }
    )
};
