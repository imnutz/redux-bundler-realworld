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
const ARTICLE_SLUG_CHANGED = getAction("ARTICLE_SLUG_CHANGED");

const REG = /^\/article/i;

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
            } else if (type === ARTICLE_SLUG_CHANGED) {
                return initialState;
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
            promise = fetchWrapper.delete(url, { authToken: token });
        } else {
            promise = fetchWrapper.post(url, { authToken: token });
        }

        return promise
            .then(json => {
                dispatch({
                    type: FOLLOW_USER_SUCCEEDED,
                    payload: json.profile
                });

                return json.profile;
            })
            .catch(() => dispatch({ type: FOLLOW_USER_FAILED }));
    },

    doDeleteArticle: (slug, token) => ({
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

        if (deleted) {
            promise = fetchWrapper.delete(url, { authToken: token });
        } else {
            promise = fetchWrapper.post(url, { authToken: token });
        }

        dispatch({ type: FAVORITE_ARTICLE_STARTED });
        return promise
            .then(json => {
                const { article } = json;

                dispatch({
                    type: FAVORITE_ARTICLE_SUCCEEDED,
                    payload: article
                });

                return article;
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

    selectIsSlugChanged: createSelector(
        "selectArticleDetails",
        "selectRouteParams",
        (article, route) => {
            const slug = route.slug || "";

            return article && article.slug !== slug;
        }
    ),

    selectIsArticleDetailsPage: createSelector(
        "selectPathname",
        pathname => REG.test(pathname)
    ),

    selectShouldGetArticle: createSelector(
        "selectArticleDetails",
        "selectIsSlugChanged",
        "selectIsFetchingArticleDetails",
        "selectIsArticleDetailsPage",
        (article, slugChanged, isFetching, articlePage) => {
            return articlePage && (!article || slugChanged) && !isFetching;
        }
    ),

    reactFetchArticle: createSelector(
        "selectShouldGetArticle",
        "selectIsSlugChanged",
        "selectRouteParams",
        "selectAuthToken",
        (shouldGetArticle, slugChanged, routeParams, authToken) => {
            const { slug } = routeParams;

            if (slugChanged) {
                return { type: ARTICLE_SLUG_CHANGED };
            } else if (shouldGetArticle) {
                return {
                    actionCreator: "doFetchArticle",
                    args: [slug, authToken]
                };
            }
        }
    ),

    reactShouldFetchComments: createSelector(
        "selectArticleDetails",
        "selectArticleComments",
        "selectIsFetchingComments",
        "selectAuthToken",
        "selectRouteParams",
        "selectIsArticleDetailsPage",
        (
            article,
            articleComments,
            isFetchingComments,
            authToken,
            routeParams,
            articlePage
        ) => {
            if (!article) return false;

            const { slug } = routeParams;

            if (!isFetchingComments && !articleComments && articlePage) {
                return {
                    actionCreator: "doFetchComments",
                    args: [slug, authToken]
                };
            }
        }
    )
};
