import { createRouteBundle } from "redux-bundler";

import Home from "../components/home";
import SignUp from "../components/signup";
import SignIn from "../components/signin";
import Editor from "../components/editor";
import ArticleDetails from "../components/article_details";

export default createRouteBundle({
    "/": Home,
    "/signup": SignUp,
    "/signin": SignIn,
    "/editor": Editor,
    "/article/:slug": ArticleDetails
});
