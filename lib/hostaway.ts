let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const res = await fetch("https://api.hostaway.com/v1/accessTokens", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.HOSTAWAY_CLIENT_ID!,
      client_secret: process.env.HOSTAWAY_CLIENT_SECRET!,
      scope: "general",
    }),
  });

  if (!res.ok) {
    throw new Error(`Hostaway auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Hostaway auth response missing access_token");
  }
  cachedToken = data.access_token as string;
  return cachedToken;
}

export async function hostawayFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`https://api.hostaway.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  // Clear cached token on 401 so next request re-authenticates
  if (res.status === 401) {
    cachedToken = null;
    throw new Error("Hostaway token expired or revoked — will re-authenticate on next request");
  }

  return res;
}
