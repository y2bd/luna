import * as React from "react";

export function useUrl() {
  const [subreddit, setSubreddit] = React.useState<string>();
  const [article, setArticle] = React.useState<string>();

  const onHash = React.useCallback(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.location.hash = "popular";
      return;
    }

    const match = window.location.hash.match(
      "^#?([A-Za-z0-9_]+)/?([A-Za-z0-9_]+)?$"
    );

    const [_, sub, art] = match ?? [];
    setSubreddit(sub || undefined);
    setArticle(art || undefined);

    if (sub) {
      document.title = "Luna - " + sub;
    } else {
      document.title = "Luna";
    }
  }, [setSubreddit, setArticle]);

  const goHome = React.useCallback(() => {
    window.location.hash = subreddit || "";
  }, [subreddit]);

  const goToArticle = React.useCallback((sub: string, art: string) => {
    window.location.hash = `${sub}/${art}`;
  }, []);

  React.useEffect(() => {
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  });

  return { subreddit, article, goHome, goToArticle };
}
