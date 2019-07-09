import { createSelector } from "redux-bundler";

import getAction from "../actions";

const FETCH_ARTICLE_STARTED = getAction("FETCH_ARTICLE_STARTED");
const FETCH_ARTICLE_FAILED = getAction("FETCH_ARTICLE_FAILED");
const FETCH_ARTICLE_SUCCEEDED = getAction("FETCH_ARTICLE_SUCCEEDED");

export default {
    name: "article",
    getReducer: () => {
        let initialState = {
            data: null,
            loading: false
        };

        return (state = initialState, { payload, type }) => {
            return state;
        };
    },

    doFetchArticle: (slug, token) => ({ dispatch, apiEnpoint }) => {
        dispatch({ type: FETCH_ARTICLE_STARTED });

        window
            .fetch(`${apiEnpoint}/articles/${slug}`, {
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
            .catch(e => dispatch({ tye: FETCH_ARTICLE_FAILED }));
    },

    selectArticleDetails: state => state.article.data,
    selectIsFetchingArticleDetails: state => state.article.loading,

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
    )
};
