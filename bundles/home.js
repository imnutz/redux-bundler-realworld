import { createSelector } from "redux-bundler";

import getAction from "../actions";

import cloneDeep from "lodash";

const HOME_UPDATE_CURRENT_TAB = getAction("HOME_UPDATE_CURRENT_TAB");
const HOME_FETCHING_FEEDS_STARTED = getAction("HOME_FETCHING_FEEDS_STARTED");
const HOME_FETCHING_FEEDS_FAILED = getAction("HOME_FETCHING_FEEDS_FAILED");
const HOME_FETCHING_FEEDS_SUCCEEDED = getAction(
    "HOME_FETCHING_FEEDS_SUCCEEDED"
);
const HOME_FETCHING_ARTICLES_STARTED = getAction(
    "HOME_FETCHING_ARTICLES_STARTED"
);
const HOME_FETCHING_ARTICLES_FAILED = getAction(
    "HOME_FETCHING_ARTICLES_FAILED"
);
const HOME_FETCHING_ARTICLES_SUCCEEDED = getAction(
    "HOME_FETCHING_ARTICLES_SUCCEEDED"
);
const HOME_FETCHING_TAGS_STARTED = getAction("HOME_FETCHING_TAGS_STARTED");
const HOME_FETCHING_TAGS_FAILED = getAction("HOME_FETCHING_TAGS_FAILED");
const HOME_FETCHING_TAGS_SUCCEEDED = getAction("HOME_FETCHING_TAGS_SUCCEEDED");
const HOME_UPDATE_FAVORITE_COUNT = getAction("HOME_UPDATE_FAVORITE_COUNT");
const HOME_UPDATE_PAGINATION_PAGE = getAction("HOME_UPDATE_PAGINATION_PAGE");

const ITEMS_PER_PAGE = 10;

export default {
    name: "home",

    getReducer: () => {
        let initialState = {
            tabs: {
                yourFeed: {
                    name: "Your Feed",
                    id: "your_feed"
                },
                globalFeed: {
                    name: "Global Feed",
                    id: "global_feed"
                }
            },
            selectedTab: null,
            currentPage: 0,
            articles: null,
            articlesCount: 0,
            tags: null,
            fetchingYourFeeds: false,
            fetchingGlobalFeeds: false,
            fetchingTags: false,
            fetchingMore: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === HOME_UPDATE_CURRENT_TAB) {
                return {
                    ...state,
                    selectedTab: payload,
                    articles: null,
                    articlesCount: 0,
                    currentPage: 0,
                    fetchingYourFeeds: false,
                    fetchingGlobalFeeds: false,
                    fetchingMore: false
                };
            } else if (type === HOME_FETCHING_FEEDS_STARTED) {
                return {
                    ...state,
                    fetchingYourFeeds: true
                };
            } else if (
                type === HOME_FETCHING_FEEDS_SUCCEEDED ||
                type === HOME_FETCHING_ARTICLES_SUCCEEDED
            ) {
                let currentArticles = state.articles || [];
                return {
                    ...state,
                    articles: [...currentArticles, ...payload.articles],
                    articlesCount: payload.articlesCount,
                    fetchingYourFeeds: false,
                    fetchingGlobalFeeds: false,
                    fetchingMore: false
                };
            } else if (type === HOME_FETCHING_FEEDS_FAILED) {
                return {
                    ...state,
                    fetchingYourFeeds: false
                };
            } else if (type == HOME_FETCHING_ARTICLES_STARTED) {
                return {
                    ...state,
                    fetchingGlobalFeeds: true
                };
            } else if (type === HOME_FETCHING_ARTICLES_FAILED) {
                return {
                    ...state,
                    fetchingGlobalFeeds: false
                };
            } else if (type === HOME_FETCHING_TAGS_STARTED) {
                return {
                    ...state,
                    fetchingTags: true
                };
            } else if (type === HOME_FETCHING_TAGS_SUCCEEDED) {
                return {
                    ...state,
                    fetchingTags: false,
                    tags: payload
                };
            } else if (type === HOME_FETCHING_TAGS_FAILED) {
                return {
                    ...state,
                    fetchingTags: false
                };
            } else if (type === HOME_UPDATE_FAVORITE_COUNT) {
                const { slug, favorited, count } = payload;
                const currentArticles = state.articles || [];
                let i;

                for (i = 0; i < currentArticles.length; i++) {
                    if (currentArticles[i].slug === slug) {
                        currentArticles[i].favoritesCount = count;
                        currentArticles[i].favorited = favorited;
                        break;
                    }
                }

                return {
                    ...state,
                    articles: [...currentArticles]
                };
            } else if (type === HOME_UPDATE_PAGINATION_PAGE) {

                let result = {
                    ...state,
                    currentPage: payload.newPage,
                    fetchingMore: true
                };

                if (payload.reset) {
                    result.articles = null;
                }

                return result;
            }

            return state;
        };
    },

    doUpdateCurrentTab: tab => ({ dispatch, store }) => {
        const currentSelectedTab = store.selectSelectedTab();

        if (tab.id !== currentSelectedTab) {
            dispatch({ type: HOME_UPDATE_CURRENT_TAB, payload: tab.id });
        }
    },

    doSelectTag: tag => ({ store }) => {
        store.doUpdateCurrentTab({ id: "#" + tag });
    },

    doFetchFeeds: (token, currentPage) => ({ dispatch, apiEndpoint, fetchWrapper }) => {
        dispatch({ type: HOME_FETCHING_FEEDS_STARTED });

        const offset = currentPage * ITEMS_PER_PAGE;
        fetchWrapper
            .get(`${apiEndpoint}/articles/feed?limit=${ITEMS_PER_PAGE}&offset=${offset}`, {
                authToken: token
            })
            .then(json => {
                dispatch({
                    type: HOME_FETCHING_FEEDS_SUCCEEDED,
                    payload: json
                });
            })
            .catch(e => {
                dispatch({ type: HOME_FETCHING_FEEDS_FAILED });
            });
    },

    doFetchArticles: (tag, currentPage) => ({
        dispatch,
        apiEndpoint,
        fetchWrapper
    }) => {
        const offset = currentPage * ITEMS_PER_PAGE;
        let url = `${apiEndpoint}/articles?limit=${ITEMS_PER_PAGE}&offset=${offset}`;

        if (tag) {
            url = url + `&tag=${tag}`;
        }

        dispatch({ type: HOME_FETCHING_ARTICLES_STARTED });
        fetchWrapper
            .get(url)
            .then(json => {
                dispatch({
                    type: HOME_FETCHING_ARTICLES_SUCCEEDED,
                    payload: json
                });
            })
            .catch(e => {
                dispatch({ type: HOME_FETCHING_ARTICLES_FAILED });
            });
    },

    doFetchTags: () => ({ dispatch, apiEndpoint, fetchWrapper }) => {
        dispatch({ type: HOME_FETCHING_TAGS_STARTED });
        fetchWrapper
            .get(`${apiEndpoint}/tags`)
            .then(json => {
                dispatch({
                    type: HOME_FETCHING_TAGS_SUCCEEDED,
                    payload: json.tags
                });
            })
            .catch(e => {
                dispatch({ type: HOME_FETCHING_TAGS_FAILED });
            });
    },

    doFavoriteHomeArticle: (slug, token, deleted) => ({ dispatch, store }) => {
        store.doFavoriteArticle(slug, token, deleted).then(article => {
            const { slug, favoritesCount: count, favorited } = article;

            dispatch({
                type: HOME_UPDATE_FAVORITE_COUNT,
                payload: { slug, count, favorited }
            });
        });
    },

    doUpdateCurrentPage: (currentPage, newPage) => ({ dispatch }) => {
        if (currentPage !== newPage) {
            dispatch({
                type: HOME_UPDATE_PAGINATION_PAGE,
                payload: { newPage, reset: newPage < currentPage }
            });
        }
    },

    selectTabs: state => state.home.tabs,
    selectSelectedTab: state => state.home.selectedTab,
    selectArticles: state => state.home.articles,
    selectTags: state => state.home.tags,
    selectIsFetchingYourFeeds: state => state.home.fetchingYourFeeds,
    selectIsFetchingGlobalFeeds: state => state.home.fetchingGlobalFeeds,
    selectIsFetchingTags: state => state.home.fetchingTags,
    selectIsFetchingForTag: state => state.home.fetchingForTag,
    selectArticlesCount: state => state.home.articlesCount,
    selectCurrentPage: state => state.home.currentPage,
    selectIsFetchingMore: state => state.home.fetchingMore,

    selectPages: createSelector(
        "selectArticlesCount",
        articlesCount => {
            if (articlesCount <= ITEMS_PER_PAGE) return [];

            const pages = Math.min(
                50,
                Math.ceil(articlesCount / ITEMS_PER_PAGE)
            );

            return [...Array(pages).keys()];
        }
    ),

    selectIsHomePage: createSelector(
        "selectPathname",
        pathname => {
            return /^\/$/i.test(pathname);
        }
    ),

    selectTabsForPage: createSelector(
        "selectTabs",
        "selectSelectedTab",
        "selectIsAuthorized",
        (tabs, selectedTab, isAuthorized) => {
            let chosenTabs = [];

            if (isAuthorized) {
                chosenTabs = [tabs.yourFeed, tabs.globalFeed];
            } else {
                chosenTabs = [tabs.globalFeed];
            }

            if (/^#/.test(selectedTab)) {
                chosenTabs.push({
                    name: selectedTab,
                    id: selectedTab
                });
            }

            return chosenTabs;
        }
    ),

    reactShouldUpdateCurrentTab: createSelector(
        "selectIsAuthorized",
        "selectTabs",
        "selectSelectedTab",
        "selectIsHomePage",
        (isAuthorized, tabs, selectedTab, isHomePage) => {
            if (isHomePage) {
                if (isAuthorized && !selectedTab) {
                    return {
                        actionCreator: "doUpdateCurrentTab",
                        args: [tabs.yourFeed]
                    };
                } else if (!selectedTab) {
                    return {
                        actionCreator: "doUpdateCurrentTab",
                        args: [tabs.globalFeed]
                    };
                }
            }
        }
    ),

    reactShouldFetchYourFeeds: createSelector(
        "selectIsFetchingYourFeeds",
        "selectSelectedTab",
        "selectArticles",
        "selectAuthToken",
        "selectIsHomePage",
        "selectCurrentPage",
        "selectIsFetchingMore",
        (
            isFetchingYourFeeds,
            selectedTab,
            articles,
            token,
            isHomePage,
            currentPage,
            isFetchingMore
        ) => {
            if (
                (isHomePage &&
                    selectedTab === "your_feed" &&
                    !articles &&
                    !isFetchingYourFeeds) ||
                (isFetchingMore && isHomePage && selectedTab === "your_feed" && !isFetchingYourFeeds)
            ) {
                return {
                    actionCreator: "doFetchFeeds",
                    args: [token, currentPage]
                };
            }
        }
    ),

    reactShouldFetchGlobalFeeds: createSelector(
        "selectIsFetchingGlobalFeeds",
        "selectArticles",
        "selectSelectedTab",
        "selectIsHomePage",
        "selectCurrentPage",
        "selectIsFetchingMore",
        (
            isFetchingGlobalFeeds,
            articles,
            selectedTab,
            isHomePage,
            currentPage,
            isFetchingMore
        ) => {
            if (
                (isHomePage &&
                    selectedTab === "global_feed" &&
                    !articles &&
                    !isFetchingGlobalFeeds) ||
                (selectedTab === "global_feed" &&
                    isFetchingMore &&
                    isHomePage &&
                    !isFetchingGlobalFeeds)
            ) {
                return {
                    actionCreator: "doFetchArticles",
                    args: ["", currentPage]
                };
            }
        }
    ),

    reactShouldFetchTags: createSelector(
        "selectIsFetchingTags",
        "selectTags",
        "selectIsHomePage",
        (isFetchingTags, tags, isHomePage) => {
            if (!isFetchingTags && !tags && isHomePage) {
                return { actionCreator: "doFetchTags" };
            }
        }
    ),

    reactShouldFetchArticlesForTag: createSelector(
        "selectIsFetchingGlobalFeeds",
        "selectSelectedTab",
        "selectArticles",
        "selectIsHomePage",
        "selectCurrentPage",
        "selectIsFetchingMore",
        (
            isFetchingGlobalFeeds,
            selectedTab,
            articles,
            isHomePage,
            currentPage,
            isFetchingMore
        ) => {
            const isTag = /^#/.test(selectedTab);
            if (
                (isHomePage && !isFetchingGlobalFeeds && isTag && !articles) ||
                (isFetchingMore && isTag && !isFetchingGlobalFeeds && isHomePage)
            ) {
                return {
                    actionCreator: "doFetchArticles",
                    args: [selectedTab.substring(1), currentPage]
                };
            }
        }
    )
};
