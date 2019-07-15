import { createSelector } from "redux-bundler";

const authUrls = ["/signin", "/signup"];

const otherUrls = [...authUrls, "/article"];

const oneOf = (urls, pathname) => {
    return urls.some(url => pathname.startsWith(url));
};

export default {
    name: "redirects",

    reactRedirect: createSelector(
        "selectIsSignedIn",
        "selectPathname",
        (isSignedIn, pathname) => {
            if (isSignedIn && oneOf(authUrls, pathname)) {
                return { actionCreator: "doUpdateUrl", args: ["/"] };
            }

            if (!isSignedIn && !oneOf(otherUrls, pathname) && pathname !== "/") {
                return { actionCreator: "doUpdateUrl", args: ["/signin"] };
            }
        }
    )
};
