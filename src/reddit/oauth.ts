import * as React from 'react';

export function useOAuth() {
  const [accessToken, setAccessToken] = React.useState<string>();

  const form = new URLSearchParams();
  form.append('grant_type', 'https://oauth.reddit.com/grants/installed_client');
  form.append('device_id', 'DO_NOT_TRACK_THIS_DEVICE');
  form.append(
    'scope',
    'identity,edit,flair,history,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,creddits'
  );

  React.useEffect(() => {
    fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      body: form,
      headers: {
        Authorization:
          'Basic ek90N2VtVjJDYzJHVVE6R3IxdW0wSUdqQkxLenN6OGlDUTV4elpFVVVn'
      }
    })
      .then(response => response.json())
      .then(json => {
        setAccessToken(json?.access_token);
      });
  }, [setAccessToken]);

  return { accessToken };
}
