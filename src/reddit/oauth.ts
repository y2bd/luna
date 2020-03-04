import * as React from "react";

export function useOAuth() {
  const [accessToken, setAccessToken] = React.useState<string>();

  const form = new URLSearchParams();
  form.append("grant_type", "https://oauth.reddit.com/grants/installed_client");
  form.append("device_id", "DO_NOT_TRACK_THIS_DEVICE");

  React.useEffect(() => {
    fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      body: form,
      headers: {
        Authorization: "Basic RDVOdkpIcmN0UFNFTWc6"
      }
    })
      .then(response => response.json())
      .then(json => {
        setAccessToken(json?.access_token);
      });
  }, []);

  return { accessToken };
}
