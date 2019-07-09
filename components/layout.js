import * as React from "react";

import { connect } from "redux-bundler-react";

import Header from "./header";
import Footer from "./footer";

export default connect(
    "selectRoute",
    ({route}) => {
        const Component = route;

        return (
            <div>
                <Header />
                <Component/>
                <Footer />
            </div>
        );
    }
);
