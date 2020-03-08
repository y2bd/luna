import * as React from 'react';
import { useOAuth } from './oauth';

export interface PostListing {
  kind: 'Listing';
  data: {
    dist: number;
    before: string | undefined;
    after: string | undefined;
    children: Post[];
  };
}

export interface Post {
  kind: 't3';
  data: {
    id: string;
    name: string;
    title: string;
    author: string;
    score: number;
    permalink: string;
    url: string;
    created_utc: number;
    subreddit: string;
    selftext_html: string;
  };

  expanded?: boolean;
}

export interface ReplyListing {
  kind: 'Listing';
  data: {
    dist: number;
    before: string | undefined;
    after: string | undefined;
    children: Reply[];
  };
}

export interface Reply {
  kind: 't1';
  data: {
    id: string;
    name: string;
    title: string;
    author: string;
    score: number;
    permalink: string;
    created_utc: number;
    body: string;
    body_html: string;
    replies: ReplyListing;
  };

  indent?: number;
  index?: number;
  top?: boolean;
}

export enum Sort {
  Best = 'best',
  Hot = 'hot',
  New = 'new'
}

export function useSubreddit(subreddit: string, sort: Sort = Sort.Hot) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const { accessToken } = useOAuth();

  React.useEffect(() => {
    setLoading(true);
    if (!accessToken) {
      return;
    }

    fetch(
      `https://oauth.reddit.com/r/${subreddit}/${sort}?api_type=json&raw_json=1`,
      {
        headers: {
          Authorization: 'bearer ' + accessToken
        },
        method: 'GET'
      }
    )
      .then(response => response.json())
      .then((json: PostListing) => {
        setPosts(json.data.children);
        setLoading(false);
        setError(undefined);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [accessToken, subreddit, sort]);

  return { posts, loading, error };
}

export function usePost(subreddit: string, article: string) {
  const [post, setPost] = React.useState<Post | undefined>();
  const [replies, setReplies] = React.useState<Reply[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const { accessToken } = useOAuth();

  React.useEffect(() => {
    setLoading(true);
    if (!accessToken) {
      return;
    }

    fetch(
      `https://oauth.reddit.com/r/${subreddit}/comments/${article}?&api_type=json&raw_json=1`,
      {
        headers: {
          Authorization: 'bearer ' + accessToken
        },
        method: 'GET'
      }
    )
      .then(response => response.json())
      .then((json: [PostListing, ReplyListing]) => {
        setPost(json[0].data.children[0]);
        setReplies(json[1].data.children);
        setError(undefined);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [subreddit, article, accessToken]);

  return { post, replies, loading, error };
}
