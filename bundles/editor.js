import { createSelector } from "redux-bundler";

import getAction from "../actions";

const EDITOR_POST_ARTICLE_STARTED = getAction("EDITOR_POST_ARTICLE_STARTED");
const EDITOR_POST_ARTICLE_FAILED = getAction("EDITOR_POST_ARTICLE_FAILED");
const EDITOR_POST_ARTICLE_SUCCEEDED = getAction(
    "EDITOR_POST_ARTICLE_SUCCEEDED"
);

const EDITOR_FETCH_ARTICLE_STARTED = getAction("EDITOR_FETCH_ARTICLE_STARTED");
const EDITOR_FETCH_ARTICLE_FAILED = getAction("EDITOR_FETCH_ARTICLE_FAILED");
const EDITOR_FETCH_ARTICLE_SUCCEEDED = getAction(
    "EDITOR_FETCH_ARTICLE_SUCCEEDED"
);

const EDITOR_UPDATE_TITLE = getAction("EDITOR_UPDATE_TITLE");
const EDITOR_UPDATE_DESC = getAction("EDITOR_UPDATE_DESC");
const EDITOR_UPDATE_BODY = getAction("EDITOR_UPDATE_BODY");
const EDITOR_UPDATE_TAGS = getAction("EDITOR_UPDATE_TAGS");

const REG = /^\/editor/i;

export default {
    name: "editor",
    getReducer: () => {
        let initialState = {
            title: null,
            shortDesc: null,
            body: null,
            tags: null,
            author: null,
            slug: null,
            loading: false,
            isEditing: false
        };

        return (state = initialState, { payload, type }) => {
            if (
                type === EDITOR_POST_ARTICLE_STARTED ||
                type === EDITOR_FETCH_ARTICLE_STARTED
            ) {
                return {
                    ...state,
                    loading: true
                };
            } else if (type === EDITOR_POST_ARTICLE_SUCCEEDED) {
                return {
                    ...state,
                    loading: false,
                    isEditing: false
                };
            } else if (
                type === EDITOR_POST_ARTICLE_FAILED ||
                type === EDITOR_FETCH_ARTICLE_FAILED
            ) {
                return {
                    ...state,
                    loading: false,
                    isEditing: false
                };
            } else if (type === EDITOR_FETCH_ARTICLE_SUCCEEDED) {
                return {
                    ...state,
                    title: payload.title,
                    shortDesc: payload.description,
                    body: payload.body,
                    tags: payload.tagList.join(","),
                    author: payload.author,
                    slug: payload.slug,
                    loading: false,
                    isEditing: true
                };
            } else if (type === EDITOR_UPDATE_TITLE) {
                return {
                    ...state,
                    title: payload
                };
            } else if (type === EDITOR_UPDATE_DESC) {
                return {
                    ...state,
                    shortDesc: payload
                };
            } else if (type === EDITOR_UPDATE_BODY) {
                return {
                    ...state,
                    body: payload
                };
            } else if (type === EDITOR_UPDATE_TAGS) {
                return {
                    ...state,
                    tags: payload
                };
            }

            return state;
        };
    },

    selectArticleTitle: state => state.editor.title,
    selectShortDescription: state => state.editor.shortDesc,
    selectArticleBody: state => state.editor.body,
    selectArticleTags: state => state.editor.tags,
    selectArticleAuthor: state => state.editor.author,
    selectArticleSlug: state => state.editor.slug,
    selectIsEditorLoading: state => state.editor.loading,
    selectIsEditingArticle: state => state.editor.isEditing,

    selectIsArticleReady: createSelector(
        "selectArticleTitle",
        "selectShortDescription",
        "selectArticleBody",
        (articleTitle, shortDescription, articleBody) => {
            return articleTitle && shortDescription && articleBody;
        }
    ),

    selectIsEditorPage: createSelector(
        "selectRouteParams",
        "selectPathname",
        (routeParams, pathname) => {
            const { slug } = routeParams;

            return REG.test(pathname) && slug;
        }
    ),

    doUpdateArticleTitle: title => ({ dispatch }) => {
        dispatch({ type: EDITOR_UPDATE_TITLE, payload: title });
    },

    doUpdateShortDescription: description => ({ dispatch }) => {
        dispatch({ type: EDITOR_UPDATE_DESC, payload: description });
    },

    doUpdateArticleBody: body => ({ dispatch }) => {
        dispatch({ type: EDITOR_UPDATE_BODY, payload: body });
    },

    doUpdateArticleTags: tags => ({ dispatch }) => {
        dispatch({ type: EDITOR_UPDATE_TAGS, payload: tags });
    },

    doPostArticle: (title, description, body, tags, isEditingArticle) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper,
        store
    }) => {
        const token = store.selectAuthToken();
        const slug = store.selectArticleSlug();

        let url = `${apiEndpoint}/articles`;
        let bodyJson = JSON.stringify({
            article: {
                title,
                description,
                body,
                tagList: (tags || "").split(",")
            }
        });

        let promise;

        dispatch({ type: EDITOR_POST_ARTICLE_STARTED });
        if (isEditingArticle) {
            url = `${apiEndpoint}/articles/${slug}`;
            promise = fetchWrapper.put(url, {
                body: bodyJson,
                authToken: token
            });
        } else {
            promise = fetchWrapper.post(url, {
                body: bodyJson,
                authToken: token
            });
        }

        promise
            .then(json => {
                const { slug } = json.article;

                dispatch({
                    type: EDITOR_POST_ARTICLE_SUCCEEDED,
                    payload: slug
                });

                store.doUpdateUrl(`/article/${slug}`);
            })
            .catch(e => dispatch({ type: EDITOR_POST_ARTICLE_FAILED }));
    },

    doFetchArticleForEditing: (slug, token) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        dispatch({ type: EDITOR_FETCH_ARTICLE_STARTED });
        fetchWrapper
            .get(`${apiEndpoint}/articles/${slug}`, { authToken: token })
            .then(response => {
                dispatch({
                    type: EDITOR_FETCH_ARTICLE_SUCCEEDED,
                    payload: response.article
                });
            })
            .catch(e => dispatch({ type: EDITOR_FETCH_ARTICLE_FAILED }));
    },

    reactShouldFetchArticleForEditing: createSelector(
        "selectRouteParams",
        "selectAuthToken",
        "selectIsArticleReady",
        "selectIsEditorPage",
        "selectIsEditorLoading",
        (
            routeParams,
            authToken,
            isArticleReady,
            isEditorPage,
            isEditorLoading
        ) => {
            const { slug } = routeParams;
            if (
                !isEditorLoading &&
                isEditorPage &&
                authToken &&
                !isArticleReady
            ) {
                return {
                    actionCreator: "doFetchArticleForEditing",
                    args: [slug, authToken]
                };
            }
        }
    )
};
