import * as React from "react";
import { connect } from "redux-bundler-react";

const createBrand = (appName) => <a className="navbar-brand" href="/">{appName}</a>
const createNavItem = (item) => {
    const {
        iconClass,
        name,
        link
    } = item;

    return (
        <li className="nav-item" key={name}>
            <a className="nav-link" href={link}>
                {
                    !iconClass ? null : (
                        <i className={iconClass} />
                    )
                }

                {name}
            </a>
        </li>
    );
}

const createNav = (navItems) => {
    return (
        <ul className="nav navbar-nav pull-xs-right">
            { navItems.map(createNavItem) }
        </ul>
    )
}

export default connect(
    "selectNavigation",
    "selectAppName",
    ({ navigation, appName }) => {
        return (
            <nav className="navbar navbar-light">
                <div className="container">
                    { createBrand(appName) }
                    { createNav( navigation) }
                </div>
            </nav>
        );
    }
);
