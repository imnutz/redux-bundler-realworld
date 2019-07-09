import { createSelector } from "redux-bundler";

export default {
    name: "header",

    getReducer: () => {
        let initialState = {
            appName: "Conduit",
            navigation: {
                home: {
                    name: "Home",
                    link: "/"
                },
                newpost: {
                    name: "New Article",
                    link: "/editor",
                    iconClass: "ion-compose"
                },
                settings: {
                    name: "Settings",
                    link: "/settings",
                    iconClass: "ion-gear-a"
                },
                signup: {
                    name: "Sign up",
                    link: "/signup"
                },
                signin: {
                    name: "Sign in",
                    link: "/signin"
                }
            },
            navigationIds: ["home", "newpost", "settings", "signup", "signin"]
        };

        return (state = initialState, { payload, type }) => {
            return state;
        };
    },

    selectNavigationItems: state => state.header.navigation,
    selectNavigationIds: state => state.header.navigationIds,

    selectNavigation: createSelector(
        "selectNavigationItems",
        "selectIsAuthorized",
        "selectUsername",
        (navigation, isAuthorized, username) => {
            let navs = [];

            if (isAuthorized) {
                navs = ["home", "newpost", "settings"].map(
                    id => navigation[id]
                );

                if (username) {
                    navs.push({
                        name: username,
                        link: `/profile/${username}`
                    });
                }
            } else {
                navs = ["home", "signin", "signup"].map(id => navigation[id]);
            }

            return navs;
        }
    ),

    selectAppName: state => state.header.appName
};
