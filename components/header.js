import * as React from "react";
import { connect } from "redux-bundler-react";
import {getNavHelper} from "internal-nav-helper";

const createBrand = appName => (
    <a className="navbar-brand" href="/">
        {appName}
    </a>
);

const createNavItem = (currentPage = {}, item) => {
    const { iconClass, name, link } = item;

    let clazz = ["nav-link"];
    if (currentPage.link === item.link) {
        clazz.push("active");
    }

    return (
        <li className="nav-item" key={name}>
            <a className={clazz.join(" ")} href={link}>
                {!iconClass ? null : <i className={iconClass} />}

                {name}
            </a>
        </li>
    );
};

const createNav = (navItems, headerCurrentPage) => {
    return (
        <ul className="nav navbar-nav pull-xs-right">
            {navItems.map(createNavItem.bind(null, headerCurrentPage))}
        </ul>
    );
};

export default connect(
    "selectNavigation",
    "selectAppName",
    "selectHeaderCurrentPage",
    "doUpdateUrl",
    ({ navigation, appName, headerCurrentPage, doUpdateUrl }) => {
        return (
            <nav className="navbar navbar-light" onClick={getNavHelper(doUpdateUrl)}>
                <div className="container">
                    {createBrand(appName)}
                    {createNav(navigation, headerCurrentPage)}
                </div>
            </nav>
        );
    }
);
