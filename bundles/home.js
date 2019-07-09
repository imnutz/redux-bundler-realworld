import { createSelector } from "redux-bundler";

import getAction from "../actions";

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
            articles: null,
            tags: null,
            fetchingYourFeeds: false,
            fetchingGlobalFeeds: false,
            fetchingTags: false
        };

        return (state = initialState, { payload, type }) => {
            if (type === HOME_UPDATE_CURRENT_TAB) {
                return {
                    ...state,
                    selectedTab: payload,
                    articles: null
                };
            } else if (type === HOME_FETCHING_FEEDS_STARTED) {
                return {
                    ...state,
                    fetchingYourFeeds: true
                };
            } else if (type === HOME_FETCHING_FEEDS_SUCCEEDED) {
                return {
                    ...state,
                    articles: payload,
                    fetchingYourFeeds: false
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
            } else if (type === HOME_FETCHING_ARTICLES_SUCCEEDED) {
                return {
                    ...state,
                    fetchingGlobalFeeds: false,
                    articles: payload
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

    doFetchFeeds: token => ({ dispatch, apiEndpoint }) => {
        dispatch({ type: HOME_FETCHING_FEEDS_STARTED });
        window
            .fetch(`${apiEndpoint}/articles/feed?limit=10&offset=0`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    dispatch({ type: HOME_FETCHING_FEEDS_FAILED });
                }

                return response.json();
            })
            .then(json => {
                dispatch({
                    type: HOME_FETCHING_FEEDS_SUCCEEDED,
                    payload: json.articles
                });
            })
            .catch(e => {
                dispatch({ type: HOME_FETCHING_FEEDS_FAILED });
            });
    },

    doFetchArticles: tag => ({ dispatch, apiEndpoint }) => {
        let url = `${apiEndpoint}/articles?limit=10&offset=0`;

        if (tag) {
            url = url + `&tag=${tag}`;
        }

        dispatch({ type: HOME_FETCHING_ARTICLES_STARTED });
        window
            .fetch(url, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    dispatch({ type: HOME_FETCHING_ARTICLES_FAILED });
                }

                return response.json();
            })
            .then(json => {
                dispatch({
                    type: HOME_FETCHING_ARTICLES_SUCCEEDED,
                    payload: json.articles
                });
            })
            .catch(e => {
                dispatch({ type: HOME_FETCHING_ARTICLES_FAILED });
            });
    },

    doFetchTags: () => ({ dispatch, apiEndpoint }) => {
        dispatch({ type: HOME_FETCHING_TAGS_STARTED });
        window
            .fetch(`${apiEndpoint}/tags`, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                const ok = response.ok;

                if (!ok) {
                    dispatch({ type: HOME_FETCHING_TAGS_FAILED });
                }

                return response.json();
            })
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

    selectTabs: state => state.home.tabs,
    selectSelectedTab: state => state.home.selectedTab,
    selectArticles: state => state.home.articles,
    selectTags: state => state.home.tags,
    selectIsFetchingYourFeeds: state => state.home.fetchingYourFeeds,
    selectIsFetchingGlobalFeeds: state => state.home.fetchingGlobalFeeds,
    selectIsFetchingTags: state => state.home.fetchingTags,
    selectIsFetchingForTag: state => state.home.fetchingForTag,

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
        (isAuthorized, tabs, selectedTab) => {
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
    ),

    reactShouldFetchYourFeeds: createSelector(
        "selectIsFetchingYourFeeds",
        "selectSelectedTab",
        "selectArticles",
        "selectAuthToken",
        (isFetchingYourFeeds, selectedTab, articles, token) => {
            if (
                selectedTab === "your_feed" &&
                (!articles || !articles.length) &&
                !isFetchingYourFeeds
            ) {
                return { actionCreator: "doFetchFeeds", args: [token] };
            }
        }
    ),

    reactShouldFetchGlobalFeeds: createSelector(
        "selectIsFetchingGlobalFeeds",
        "selectArticles",
        "selectSelectedTab",
        (isFetchingGlobalFeeds, articles, selectedTab) => {
            if (
                selectedTab === "global_feed" &&
                (!articles || !articles.length) &&
                !isFetchingGlobalFeeds
            ) {
                return { actionCreator: "doFetchArticles" };
            }
        }
    ),

    reactShouldFetchTags: createSelector(
        "selectIsFetchingTags",
        "selectTags",
        (isFetchingTags, tags) => {
            if (!isFetchingTags && (!tags || !tags.length)) {
                return { actionCreator: "doFetchTags" };
            }
        }
    ),

    reactShouldFetchArticlesForTag: createSelector(
        "selectIsFetchingGlobalFeeds",
        "selectSelectedTab",
        "selectArticles",
        (isFetchingGlobalFeeds, selectedTab, articles) => {
            if (
                !isFetchingGlobalFeeds &&
                /^#/.test(selectedTab) &&
                (!articles || !articles.length)
            ) {
                return {
                    actionCreator: "doFetchArticles",
                    args: [selectedTab.substring(1)]
                };
            }
        }
    )
};
