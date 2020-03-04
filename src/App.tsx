import * as React from "react";
import "./App.css";
import { useSubreddit, Post, usePost, Reply } from "./reddit/reddit";
import { useUrl } from "./reddit/url";

function App() {
  const { subreddit, article } = useUrl();

  if (subreddit && article) {
    return <RepliesView subreddit={subreddit} article={article} />;
  } else if (subreddit) {
    return <PostsView subreddit={subreddit} />;
  } else {
    return <div className="App">{<p>Loading...</p>}</div>;
  }
}

const PostsView: React.FC<{ subreddit: string }> = ({ subreddit }) => {
  const { posts, loading, error } = useSubreddit(subreddit);
  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {error && <p>Error Whoops... {error.message}</p>}
      {posts && posts.map(post => <PostView key={post.data.id} {...post} />)}
    </div>
  );
};

const PostView: React.FC<Post> = post => {
  const { goToArticle } = useUrl();
  const { expanded } = post;
  const { id, permalink, url, subreddit, selftext_html } = post.data;
  const onDivClick = React.useCallback(() => window.open(url), [permalink]);

  const onCommentClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
      evt.stopPropagation();
      goToArticle(subreddit!, id);
    },
    [subreddit, id]
  );

  const onLinkClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void =>
      evt.preventDefault(),
    []
  );

  const domain = React.useMemo(
    () => url.match("^https?://(?:www\\.)?(.+?)(?:/.*)?$")?.[1],
    [url]
  );

  return (
    <div className="Post" onClick={onDivClick}>
      <div className="PostData">
        <a href={url} onClick={onLinkClick}>
          {post.data.title}
        </a>
        <aside>{domain}</aside>
        {expanded && selftext_html && (
          <article dangerouslySetInnerHTML={{ __html: selftext_html }} />
        )}
      </div>
      {!expanded && (
        <aside className="CommentButton" onClick={onCommentClick}>
          <a>❞</a>
        </aside>
      )}
    </div>
  );
};

const RepliesView: React.FC<{ subreddit: string; article: string }> = ({
  subreddit,
  article
}) => {
  const { post, replies, loading, error } = usePost(subreddit, article);

  React.useLayoutEffect(() => {
    const anchors = document.querySelectorAll(".ReplyData .md a");
    anchors.forEach(elem => {
      const anchor = elem as HTMLAnchorElement;
      anchor.target = "_blank";
      if (anchor.href.includes(window.location.host)) {
        anchor.href =
          "https://reddit.com" +
          anchor.href.slice(window.location.origin.length);
      }
    });
  }, [replies]);

  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {error && <p>Error Whoops... {error.message}</p>}
      {post && <PostView expanded {...post} />}
      {replies &&
        replies.map(reply => (
          <ReplyView key={reply.data.id} index={-1} {...reply} />
        ))}
    </div>
  );
};

const ReplyView: React.FC<Reply> = reply => {
  const { indent = 0, index } = reply;
  const { body_html, replies } = reply.data;

  const [expanded, setExpanded] = React.useState(true);

  const divRef = React.useRef<HTMLDivElement | null>(null);

  const hasChildren =
    (replies?.data?.children.filter(child => !!child.data.body).length ?? 0) >
    0;
  const isFirst = index === 0;
  const isTop = index === -1;

  return (
    <>
      <div
        className={"Reply " + (isTop ? "Top " : "")}
        ref={divRef}
        onClick={(e: any) => {
          if (!hasChildren) return;
          if (
            e.target.tagName.toLowerCase() !== "a" &&
            !window.getSelection()?.toString()
          )
            setExpanded(!expanded);
        }}
      >
        <div style={{ display: "flex" }}>
          {new Array(indent).fill(0).map(() => (
            <div className="Indent" />
          ))}
        </div>
        <div
          className={
            "ReplyData " +
            (hasChildren ? "Children " : "") +
            (isFirst ? "First " : "")
          }
        >
          <article dangerouslySetInnerHTML={{ __html: body_html }} />
        </div>
      </div>
      {expanded &&
        replies &&
        replies.data.children
          .filter(reply => !!reply.data.body)
          .map((reply, index) => (
            <ReplyView
              key={reply.data.id + reply.data.author}
              index={index}
              indent={indent + 1}
              {...reply}
            />
          ))}
      {!expanded && <div className="Collapsed" />}

      {isTop && <div className="Collapsed" />}
    </>
  );
};

export default App;
