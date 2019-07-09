import { createSelector } from "redux-bundler";

import getAction from "../actions";

const EDITOR_POST_ARTICLE_STARTED = getAction("EDITOR_POST_ARTICLE_STARTED");
const EDITOR_POST_ARTICLE_FAILED = getAction("EDITOR_POST_ARTICLE_FAILED");
const EDITOR_POST_ARTICLE_SUCCEEDED = getAction(
    "EDITOR_POST_ARTICLE_SUCCEEDED"
);

export default {
    name: "editor",
    getReducer: () => {
        let initialState = {
            title: null,
            shortDesc: null,
            body: null,
            tags: null,
            loading: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === EDITOR_POST_ARTICLE_STARTED) {
                return {
                    ...state,
                    loading: true
                };
            } else if (type === EDITOR_POST_ARTICLE_SUCCEEDED) {
                return {
                    ...state,
                    loading: false
                };
            } else if (type === EDITOR_POST_ARTICLE_FAILED) {
                return {
                    ...state,
                    loading: false
                };
            }
            return state;
        };
    },

    selectArticleTitle: state => state.editor.title,
    selectShortDescription: state => state.editor.showDesc,
    selectArticleBody: state => state.editor.body,
    selectArticleTags: state => state.editor.tags,

    doPostArticle: (title, description, body, tags) => ({
        dispatch,
        apiEndpoint,
        store
    }) => {
        const token = store.selectAuthToken();

        dispatch({ type: EDITOR_POST_ARTICLE_STARTED });
        window
            .fetch(`${apiEndpoint}/articles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    body,
                    tagList: (tags || "").split(",")
                })
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    return dispatch({ type: EDITOR_POST_ARTICLE_FAILED });
                }

                return response.json();
            })
            .then(json => {
                const { slug } = json.article;

                dispatch({
                    type: EDITOR_POST_ARTICLE_SUCCEEDED,
                    payload: slug
                });
            })
            .catch(e => dispatch({ type: EDITOR_POST_ARTICLE_FAILED }));
    }
};
