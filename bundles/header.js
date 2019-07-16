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

    selectHeaderCurrentPage: createSelector(
        "selectPathname",
        "selectNavigationItems",
        (pathname, navigation) => {
            if (pathname === "/") {
                return navigation["home"];
            }

            if (pathname.startsWith("/signin")) {
                return navigation["signin"];
            }

            if (pathname.startsWith("/signup")) {
                return navigation["signup"];
            }

            if (pathname.startsWith("/editor")) {
                return navigation["newpost"];
            }

            if (pathname.startsWith("/settings")) {
                return navigation["settings"];
            }

            if (pathname.startsWith("/profile")) {
                return {
                    link: decodeURIComponent(pathname)
                };
            }
        }
    ),

    selectAppName: state => state.header.appName
};
