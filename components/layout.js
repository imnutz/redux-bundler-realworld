import * as React from "react";

import { connect } from "redux-bundler-react";
import { getNavHelper } from "internal-nav-helper";

import Header from "./header";
import Footer from "./footer";

export default connect(
    "selectRoute",
    "doUpdateUrl",
    ({ route, doUpdateUrl }) => {
        const Component = route;

        return (
            <div onClick={getNavHelper(doUpdateUrl)}>
                <Header />
                <Component />
                <Footer />
            </div>
        );
    }
);
