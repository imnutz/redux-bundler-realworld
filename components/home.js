import * as React from "react";

import { connect } from "redux-bundler-react";

const renderTabs = (selectedTab = null, tabs = [], doUpdateCurrentTab) => {
    return (
        <ul className="nav nav-pills outline-active">
            {tabs.map(tab => {
                let clazz = ["nav-link"];
                const handler = doUpdateCurrentTab.bind(null, tab);

                if (tab.id === selectedTab) {
                    clazz.push("active");
                }

                return (
                    <li className="nav-item" key={tab.id}>
                        <a
                            className={clazz.join(" ")}
                            href="#"
                            onClick={handler}
                        >
                            {tab.name}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

const renderBanner = () => {
    return (
        <div className="banner">
            <div className="container">
                <h1 className="logo-font">conduit</h1>
                <p>A place to share your knowledge.</p>
            </div>
        </div>
    );
};

const renderArticlesLoading = () => {
    return <div className="article-preview">Loading articles...</div>;
};

const renderTagsLoading = () => {
    return <div>Loading tags...</div>;
};

const renderArticles = (articles = []) => {
    return articles.map(article => {
        return (
            <div className="article-preview" key={article.slug}>
                <div className="article-meta">
                    <a href="profile.html">
                        <img src={article.author.image} alt="" />
                    </a>
                    <div className="info">
                        <a href="" className="author">
                            {article.author.username}
                        </a>
                        <span className="date">{article.createAt}</span>
                    </div>
                    <button className="btn btn-outline-primary btn-sm pull-xs-right">
                        <i className="ion-heart" />
                        &nbsp;{article.favoritesCount}
                    </button>
                </div>
                <a href={`/article/${article.slug}`} className="preview-link">
                    <h1>{article.title}</h1>
                    <p>{article.body}</p>
                    <span>Read more...</span>
                </a>
            </div>
        );
    });
};

const renderTagsList = (tags = [], doSelectTag) => {
    return (
        <div className="tag-list">
            {tags.map(tag => {
                const handler = doSelectTag.bind(null, tag);

                return (
                    <a
                        href="#"
                        className="tag-pill tag-default"
                        key={tag}
                        onClick={handler}
                    >
                        {tag}
                    </a>
                );
            })}
        </div>
    );
};

export default connect(
    "selectIsAuthorized",
    "selectSelectedTab",
    "selectTabsForPage",
    "selectArticles",
    "selectTags",
    "doUpdateCurrentTab",
    "doSelectTag",
    ({
        isAuthorized,
        selectedTab,
        tabsForPage,
        articles = [],
        tags = [],
        doUpdateCurrentTab,
        doSelectTag
    }) => {
        return (
            <div className="home-page">
                {!isAuthorized ? renderBanner() : null}

                <div className="container page">
                    <div className="row">
                        <div className="col-md-9">
                            <div className="feed-toggle">
                                {renderTabs(
                                    selectedTab,
                                    tabsForPage,
                                    doUpdateCurrentTab
                                )}
                            </div>

                            {!articles || !articles.length
                                ? renderArticlesLoading()
                                : renderArticles(articles)}
                        </div>

                        <div className="col-md-3">
                            <div className="sidebar">
                                <p>Popular Tags</p>

                                {tags && tags.length
                                    ? renderTagsList(tags, doSelectTag)
                                    : renderTagsLoading()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
