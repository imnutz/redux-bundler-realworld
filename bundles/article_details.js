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

const FAVORITE_ARTICLE_STARTED = getAction("FAVORITE_ARTICLE_STARTED");
const FAVORITE_ARTICLE_FAILED = getAction("FAVORITE_ARTICLE_FAILED");
const FAVORITE_ARTICLE_SUCCEEDED = getAction("FAVORITE_ARTICLE_SUCCEEDED");

const UPDATE_USER_COMMENT = getAction("UPDATE_USER_COMMENT");

const POST_COMMENT_SUCCEEDED = getAction("POST_COMMENT_SUCCEEDED");
const POST_COMMENT_FAILED = getAction("POST_COMMENT_FAILED");
const DELETE_COMMENT_SUCCEEDED = getAction("DELETE_COMMENT_SUCCEEDED");

export default {
    name: "article",
    getReducer: () => {
        let initialState = {
            data: null,
            comments: null,
            loading: false,
            fetchingComments: false,
            userComment: null
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
            } else if (type === FAVORITE_ARTICLE_SUCCEEDED) {
                let data = state.data;
                return {
                    ...state,
                    data: {
                        ...data,
                        favorited: payload.favorited,
                        favoritesCount: payload.favoritesCount,
                        updatedAt: payload.updatedAt
                    }
                };
            } else if (type === UPDATE_USER_COMMENT) {
                return {
                    ...state,
                    userComment: payload
                };
            } else if (type === POST_COMMENT_SUCCEEDED) {
                const currentComments = state.comments;

                return {
                    ...state,
                    comments: [payload, ...currentComments],
                    userComment: null
                };
            } else if (type === DELETE_COMMENT_SUCCEEDED) {
                let currentComments = state.comments;
                const deletedId = payload;

                currentComments = currentComments.filter(
                    comment => comment.id !== deletedId
                );

                return {
                    ...state,
                    comments: currentComments
                };
            }

            return state;
        };
    },

    doFetchArticle: (slug, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        dispatch({ type: FETCH_ARTICLE_STARTED });

        fetchWrapper
            .get(`${apiEndpoint}/articles/${slug}`, {
                authToken: token
            })
            .then(json => {
                dispatch({
                    type: FETCH_ARTICLE_SUCCEEDED,
                    payload: json.article
                });
            })
            .catch(e => dispatch({ type: FETCH_ARTICLE_FAILED }));
    },

    doFetchComments: (slug, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        dispatch({ type: FETCH_COMMENTS_STARTED });

        fetchWrapper
            .get(`${apiEndpoint}/articles/${slug}/comments`, {
                authToken: token
            })
            .then(json => {
                dispatch({
                    type: FETCH_COMMENTS_SUCCEEDED,
                    payload: json.comments
                });
            })
            .catch(e => {
                dispatch({ type: FETCH_COMMENTS_FAILED });
            });
    },

    doFollowUser: (username, token, deleted) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper,
        store
    }) => {
        if (!token) {
            return store.doUpdateUrl("/signin");
        }

        let promise,
            url = `${apiEndpoint}/profiles/${username}/follow`;

        dispatch({ type: FOLLOW_USER_STARTED });

        if (deleted) {
            promise = fetchWrapper.delete(url, { body: "", authToken: token });
        } else {
            promise = fetchWrapper.post(url, { body: "", authToken: token });
        }

        promise
            .then(json => {
                dispatch({
                    type: FOLLOW_USER_SUCCEEDED,
                    payload: json.profile
                });
            })
            .catch(() => dispatch({ type: FOLLOW_USER_FAILED }));
    },

    doDeleteArticle: (slug, token) => ({
        dispatch,
        store,
        apiEndpoint,
        fetchWrapper
    }) => {
        fetchWrapper
            .delete(`${apiEndpoint}/articles/${slug}`, { authToken: token })
            .then(() => {
                store.doUpdateUrl("/");
            });
    },

    doFavoriteArticle: (slug, token, deleted) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper,
        store
    }) => {
        if (!token) {
            return store.doUpdateUrl("/signin");
        }

        let promise,
            url = `${apiEndpoint}/articles/${slug}/favorite`;

        let method = "POST";

        if (deleted) {
            promise = fetchWrapper.delete(url, { body: "", authToken: token });
        } else {
            promise = fetchWrapper.post(url, { body: "", authToken: token });
        }

        dispatch({ type: FAVORITE_ARTICLE_STARTED });
        promise
            .then(json => {
                dispatch({
                    type: FAVORITE_ARTICLE_SUCCEEDED,
                    payload: json.article
                });
            })
            .catch(() => dispatch({ type: FAVORITE_ARTICLE_FAILED }));
    },

    doPostComment: (slug, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper,
        store
    }) => {
        const comment = store.selectUserComment();

        if (comment) {
            fetchWrapper
                .post(`${apiEndpoint}/articles/${slug}/comments`, {
                    body: JSON.stringify({ comment: { body: comment } }),
                    authToken: token
                })
                .then(response => {
                    dispatch({
                        type: POST_COMMENT_SUCCEEDED,
                        payload: response.comment
                    });
                })
                .catch(e => dispatch({ type: POST_COMMENT_FAILED }));
        }
    },

    doUpdateUserComment: value => ({ dispatch }) => {
        dispatch({ type: UPDATE_USER_COMMENT, payload: value });
    },

    doDeleteUserComment: (slug, token, commentId) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        fetchWrapper
            .delete(`${apiEndpoint}/articles/${slug}/comments/${commentId}`, {
                authToken: token
            })
            .then(response => {
                dispatch({
                    type: DELETE_COMMENT_SUCCEEDED,
                    payload: commentId
                });
            });
    },

    selectArticleDetails: state => state.article.data,
    selectArticleComments: state => state.article.comments,
    selectUserComment: state => state.article.userComment,
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

            if (!isFetchingComments && !articleComments && slug) {
                return {
                    actionCreator: "doFetchComments",
                    args: [slug, authToken]
                };
            }
        }
    )
};
