import { createSelector } from "redux-bundler";

import getAction from "../actions";

const FETCH_ARTICLE_STARTED = getAction("FETCH_ARTICLE_STARTED");
const FETCH_ARTICLE_FAILED = getAction("FETCH_ARTICLE_FAILED");
const FETCH_ARTICLE_SUCCEEDED = getAction("FETCH_ARTICLE_SUCCEEDED");

const FETCH_COMMENTS_STARTED = getAction("FETCH_COMMENTS_STARTED");
const FETCH_COMMENTS_FAILED = getAction("FETCH_COMMENTS_FAILED");
const FETCH_COMMENTS_SUCCEEDED = getAction("FETCH_COMMENTS_SUCCEEDED");

const FOLLOW_USER_STARTED = getAction("FOLLOW_USER_STARTED");
const FOLLOW_USER_FAILED = getAction("FOLLOW_USER_FAILED");
const FOLLOW_USER_SUCCEEDED = getAction("FOLLOW_USER_SUCCEEDED");

export default {
    name: "article",
    getReducer: () => {
        let initialState = {
            data: null,
            comments: null,
            loading: false,
            fetchingComments: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === FETCH_ARTICLE_STARTED) {
                return {
                    ...state,
                    loading: true
                };
            } else if (type === FETCH_ARTICLE_SUCCEEDED) {
                return {
                    ...state,
                    data: payload,
                    loading: false
                };
            } else if (type === FETCH_ARTICLE_FAILED) {
                return {
                    ...state,
                    loading: false
                };
            } else if (type === FETCH_COMMENTS_STARTED) {
                return {
                    ...state,
                    fetchingComments: true
                };
            } else if (type === FETCH_COMMENTS_SUCCEEDED) {
                return {
                    ...state,
                    fetchingComments: false,
                    comments: payload
                };
            } else if (type === FETCH_COMMENTS_FAILED) {
                return {
                    ...state,
                    fetchingComments: false
                };
            } else if (type === FOLLOW_USER_SUCCEEDED) {
                let data = state.data;

                return {
                    ...state,
                    data: {
                        ...data,
                        author: payload
                    }
                };
            }
            return state;
        };
    },

    doFetchArticle: (slug, token) => ({ dispatch, apiEndpoint }) => {
        dispatch({ type: FETCH_ARTICLE_STARTED });

        window
            .fetch(`${apiEndpoint}/articles/${slug}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    return dispatch({ type: FETCH_ARTICLE_FAILED });
                }

                return response.json();
            })
            .then(json => {
                dispatch({
                    type: FETCH_ARTICLE_SUCCEEDED,
                    payload: json.article
                });
            })
            .catch(e => dispatch({ type: FETCH_ARTICLE_FAILED }));
    },

    doFetchComments: (slug, token) => ({ dispatch, apiEndpoint }) => {
        dispatch({ type: FETCH_COMMENTS_STARTED });

        window
            .fetch(`${apiEndpoint}/articles/${slug}/comments`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    return dispatch({ type: FETCH_COMMENTS_FAILED });
                }

                return response.json();
            })
            .then(json => {
                dispatch({
                    type: FETCH_COMMENTS_SUCCEEDED,
                    payload: json.comments
                });
            })
            .catch(() => dispatch({ type: FETCH_COMMENTS_FAILED }));
    },

    doFollowUser: (username, token, deleted) => ({ dispatch, apiEndpoint }) => {
        let method = "POST";

        if (deleted) {
            method = "DELETE";
        }

        dispatch({ type: FOLLOW_USER_STARTED });
        window
            .fetch(`${apiEndpoint}/profiles/${username}/follow`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    return dispatch({ type: FOLLOW_USER_FAILED });
                }

                return response.json();
            })
            .then(json => {
                dispatch({
                    type: FOLLOW_USER_SUCCEEDED,
                    payload: json.profile
                });
            })
            .catch(() => dispatch({ type: FOLLOW_USER_FAILED }));
    },

    doFavoriteArticle: slug => ({ dispatch, apiEndpoint }) => {},

    selectArticleDetails: state => state.article.data,
    selectArticleComments: state => state.article.comments,
    selectIsFetchingArticleDetails: state => state.article.loading,
    selectIsFetchingComments: state => state.article.fetchingComments,

    reactShouldFetchArticle: createSelector(
        "selectRouteParams",
        "selectArticleDetails",
        "selectIsFetchingArticleDetails",
        "selectAuthToken",
        (routeParams, articleDetails, isFetchingArticleDetails, authToken) => {
            const { slug } = routeParams;

            if (!isFetchingArticleDetails && !articleDetails && slug) {
                return {
                    actionCreator: "doFetchArticle",
                    args: [slug, authToken]
                };
            }
        }
    ),

    reactShouldFetchComments: createSelector(
        "selectArticleComments",
        "selectIsFetchingComments",
        "selectAuthToken",
        "selectRouteParams",
        (articleComments, isFetchingComments, authToken, routeParams) => {
            const { slug } = routeParams;

            if (
                !isFetchingComments &&
                (!articleComments || !articleComments.length)
            ) {
                return {
                    actionCreator: "doFetchComments",
                    args: [slug, authToken]
                };
            }
        }
    )
};
