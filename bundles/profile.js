import { createSelector } from "redux-bundler";

import getAction from "../actions";

const REG = /^\/profile/i;

const PROFILE_FETCH_ARTICLES_STARTED = getAction(
    "PROFILE_FETCH_ARTICLES_STARTED"
);
const PROFILE_FETCH_ARTICLES_FAILED = getAction(
    "PROFILE_FETCH_ARTICLES_FAILED"
);
const PROFILE_FETCH_ARTICLES_SUCCEEDED = getAction(
    "PROFILE_FETCH_ARTICLES_SUCCEEDED"
);

const PROFILE_FETCH_PROFILE_STARTED = getAction(
    "PROFILE_FETCH_PROFILE_STARTED"
);
const PROFILE_FETCH_PROFILE_FAILED = getAction("PROFILE_FETCH_PROFILE_FAILED");
const PROFILE_FETCH_PROFILE_SUCCEEDED = getAction(
    "PROFILE_FETCH_PROFILE_SUCCEEDED"
);

const PROFILE_UPDATE_SELECTED_TAB = getAction("PROFILE_UPDATE_SELECTED_TAB");
const PROFILE_UPDATE_FAVORITE_STATS = getAction(
    "PROFILE_UPDATE_FAVORITE_STATS"
);
const PROFILE_UPDATE_FOLLOWING_STATS = getAction(
    "PROFILE_UPDATE_FOLLOWING_STATS"
);
export default {
    name: "profile",

    getReducer: () => {
        let initialState = {
            profile: null,
            articles: null,
            loading: false,
            fetchingProfile: false,
            tabs: {
                myArticles: {
                    name: "My Articles",
                    id: "my_articles"
                },
                favoritedArticles: {
                    name: "Favorited Articles",
                    id: "favorited_articles"
                }
            },
            selectedTab: "my_articles"
        };

        return (state = initialState, { payload, type }) => {
            if (type === PROFILE_FETCH_ARTICLES_STARTED) {
                return {
                    ...state,
                    loading: true
                };
            } else if (type === PROFILE_FETCH_ARTICLES_FAILED) {
                return {
                    ...state,
                    loading: false
                };
            } else if (type === PROFILE_FETCH_ARTICLES_SUCCEEDED) {
                return {
                    ...state,
                    articles: [...payload],
                    loading: false
                };
            } else if (type === PROFILE_UPDATE_SELECTED_TAB) {
                return {
                    ...state,
                    selectedTab: payload,
                    articles: null
                };
            } else if (type === PROFILE_FETCH_PROFILE_STARTED) {
                return {
                    ...state,
                    fetchingProfile: true
                };
            } else if (type === PROFILE_FETCH_PROFILE_SUCCEEDED) {
                return {
                    ...state,
                    profile: payload,
                    fetchingProfile: false
                };
            } else if (type === PROFILE_FETCH_PROFILE_FAILED) {
                return {
                    ...state,
                    fetchingProfile: false
                };
            } else if (type === PROFILE_UPDATE_FAVORITE_STATS) {
                let currentArticles = state.articles || [],
                    length = currentArticles.length,
                    i;

                for (i = 0; i < length; i++) {
                    if (currentArticles[i].slug === payload.slug) {
                        currentArticles[i].favorited = payload.favorited;
                        currentArticles[i].favoritesCount =
                            payload.favoritesCount;

                        break;
                    }
                }

                return {
                    ...state,
                    articles: [...currentArticles]
                };
            } else if (type === PROFILE_UPDATE_FOLLOWING_STATS) {
                const curProfile = state.profile;

                return {
                    ...state,
                    profile: {
                        ...curProfile,
                        following: payload.following
                    }
                };
            }

            return state;
        };
    },

    selectProfilePageTabs: state => state.profile.tabs,
    selectProfileArticles: state => state.profile.articles,
    selectIsFetchingProfileArticles: state => state.profile.loading,
    selectProfileSelectedTab: state => state.profile.selectedTab,
    selectProfileTabs: state => state.profile.tabs,
    selectProfileTabsAsArray: state => Object.values(state.profile.tabs),
    selectUserProfile: state => state.profile.profile,
    selectIsFetchingProfile: state => state.profile.fetchingProfile,

    selectIsProfilePage: createSelector(
        "selectRouteParams",
        "selectPathname",
        (routeParams, pathname) => {
            const { username } = routeParams;

            return REG.test(pathname) && username;
        }
    ),

    selectProfileUsername: createSelector(
        "selectRouteParams",
        "selectIsProfilePage",
        (routeParams, isProfilePage) => {
            return isProfilePage && routeParams.username;
        }
    ),

    selectIsCurrentUser: createSelector(
        "selectUsername",
        "selectRouteParams",
        (username, routeParams) => {
            const { username: routeUsername } = routeParams;

            return username === decodeURIComponent(routeUsername);
        }
    ),

    doUpdateProfileSelectedTab: (currentSelectedTab, tabId) => ({
        dispatch
    }) => {
        if (currentSelectedTab !== tabId) {
            dispatch({ type: PROFILE_UPDATE_SELECTED_TAB, payload: tabId });
        }
    },

    doFetchMyArticles: (username, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        dispatch({ type: PROFILE_FETCH_ARTICLES_STARTED });
        fetchWrapper
            .get(
                `${apiEndpoint}/articles?author=${username}&limit=5&offset=0`,
                {
                    authToken: token
                }
            )
            .then(response => {
                dispatch({
                    type: PROFILE_FETCH_ARTICLES_SUCCEEDED,
                    payload: response.articles
                });
            })
            .catch(e => dispatch({ type: PROFILE_FETCH_ARTICLES_FAILED }));
    },

    doFetchFavoritedArticles: (username, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        dispatch({ type: PROFILE_FETCH_ARTICLES_STARTED });
        fetchWrapper
            .get(
                `${apiEndpoint}/articles?favorited=${username}&limit=5&offset=0`,
                {
                    authToken: token
                }
            )
            .then(response => {
                dispatch({
                    type: PROFILE_FETCH_ARTICLES_SUCCEEDED,
                    payload: response.articles
                });
            })
            .catch(e => dispatch({ type: PROFILE_FETCH_ARTICLES_FAILED }));
    },

    doFetchUserProfile: (username, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        dispatch({ type: PROFILE_FETCH_PROFILE_STARTED });
        fetchWrapper
            .get(`${apiEndpoint}/profiles/${username}`, { authToken: token })
            .then(response => {
                dispatch({
                    type: PROFILE_FETCH_PROFILE_SUCCEEDED,
                    payload: response.profile
                });
            })
            .catch(() => dispatch({ type: PROFILE_FETCH_PROFILE_FAILED }));
    },

    doFollowProfile: (username, token, deleted) => ({ dispatch, store }) => {
        store.doFollowUser(username, token, deleted).then(profile => {
            dispatch({
                type: PROFILE_UPDATE_FOLLOWING_STATS,
                payload: profile
            });
        });
    },

    doFavoriteProfileArticle: (slug, token, deleted) => ({
        dispatch,
        store
    }) => {
        store.doFavoriteArticle(slug, token, deleted).then(article => {
            dispatch({ type: PROFILE_UPDATE_FAVORITE_STATS, payload: article });
        });
    },

    reactShouldFetchArticles: createSelector(
        "selectIsProfilePage",
        "selectProfileArticles",
        "selectIsFetchingProfileArticles",
        "selectProfileSelectedTab",
        "selectProfileTabs",
        "selectAuthToken",
        "selectRouteParams",
        (
            isProfilePage,
            profileArticles,
            isFetchingProfileArticles,
            profileSelectedTab,
            profileTabs,
            authToken,
            routeParams
        ) => {
            if (
                isProfilePage &&
                !profileArticles &&
                !isFetchingProfileArticles
            ) {
                const { username } = routeParams;

                if (profileSelectedTab === profileTabs.myArticles.id) {
                    return {
                        actionCreator: "doFetchMyArticles",
                        args: [username, authToken]
                    };
                } else {
                    return {
                        actionCreator: "doFetchFavoritedArticles",
                        args: [username, authToken]
                    };
                }
            }
        }
    ),

    reactShouldFetchUserProfile: createSelector(
        "selectRouteParams",
        "selectIsProfilePage",
        "selectUserProfile",
        "selectIsFetchingProfile",
        "selectAuthToken",
        (
            routeParams,
            isProfilePage,
            userProfile,
            isFetchingProfile,
            authToken
        ) => {
            if (isProfilePage && !userProfile && !isFetchingProfile) {
                const { username } = routeParams;

                return {
                    actionCreator: "doFetchUserProfile",
                    args: [username, authToken]
                };
            }
        }
    )
};
