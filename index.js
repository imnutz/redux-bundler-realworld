import * as React from "react";
import { render } from "react-dom";

import { Provider } from "redux-bundler-react";

import getStore from "./bundles";

import Layout from "./components/layout";

const store = getStore();

render(
    <Provider store={store}>
        <Layout />
    </Provider>,
    document.querySelector("#app")
);
