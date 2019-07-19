import { createSelector } from "redux-bundler";

const authUrls = ["/signin", "/signup"];

const otherUrls = [...authUrls, "/article", "/profile", "/settings"];

const oneOf = (urls, pathname) => {
    return urls.some(url => pathname.startsWith(url));
};

export default {
    name: "redirects",

    reactRedirect: createSelector(
        "selectIsSignedIn",
        "selectPathname",
        (isSignedIn, pathname) => {
            if (
                isSignedIn &&
                (pathname === "/signin" || pathname === "/signup")
            ) {
                return { actionCreator: "doUpdateUrl", args: ["/"] };
            }

            if (!isSignedIn && pathname.startsWith("/settings")) {
                return { actionCreator: "doUpdateUrl", args: ["/signin"] };
            }
        }
    )
};
