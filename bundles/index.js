import {
    createUrlBundle,
    createReactorBundle,
    composeBundlesRaw
} from "redux-bundler";

import header from "./header";
import routes from "./routes";
import signup from "./signup";
import signin from "./signin";
import auth from "./auth";
import home from "./home";
import editor from "./editor";
import settings from "./settings";
import profile from "./profile";
import articleDetails from "./article_details";
import redirects from "./redirects";
import extraArgs from "./extra-args";

export default composeBundlesRaw(
    createUrlBundle(),
    createReactorBundle(),
    header,
    signup,
    signin,
    auth,
    redirects,
    home,
    editor,
    settings,
    profile,
    articleDetails,
    routes,
    extraArgs
);
