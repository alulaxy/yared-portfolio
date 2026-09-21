/**
 * GitHub OAuth proxy for Decap CMS, deployed as a Cloudflare Worker.
 *
 * Replaces Netlify Identity + git-gateway so the /admin panel can log in
 * with a plain GitHub account instead.
 *
 * Setup:
 *  1. Create a GitHub OAuth App (github.com -> Settings -> Developer settings
 *     -> OAuth Apps -> New OAuth App):
 *       - Homepage URL:     https://yaredg.com
 *       - Callback URL:     https://<this-worker>.workers.dev/callback
 *  2. Deploy this file as a Cloudflare Worker (Workers & Pages -> Create ->
 *     paste this code).
 *  3. In the Worker's Settings -> Variables, add two secrets:
 *       GITHUB_CLIENT_ID      = the OAuth App's Client ID
 *       GITHUB_CLIENT_SECRET  = the OAuth App's Client Secret
 *  4. In admin/config.yml, set base_url to this worker's URL
 *     (e.g. https://yaredg-cms-auth.<your-subdomain>.workers.dev).
 */

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

function randomState() {
  return crypto.randomUUID();
}

function htmlResponse(body) {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const state = randomState();

  const redirectUri = `${url.origin}/callback`;
  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  const response = Response.redirect(authorizeUrl.toString(), 302);
  return response;
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return htmlResponse("<p>Missing code from GitHub.</p>");
  }

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error || !tokenData.access_token) {
    return htmlResponse(
      `<p>GitHub auth error: ${tokenData.error_description || tokenData.error || "unknown error"}</p>`
    );
  }

  // Decap CMS expects the opener window to receive a postMessage in this
  // exact format, then it completes the login itself.
  const payload = JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
  });

  const script = `
    <!doctype html>
    <html>
      <body>
        <script>
          (function() {
            function receiveMessage(message) {
              window.opener.postMessage(
                'authorization:github:success:${payload.replace(/'/g, "\\'")}',
                message.origin
              );
              window.removeEventListener("message", receiveMessage, false);
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
      </body>
    </html>
  `;

  return htmlResponse(script);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(request, env);
    }
    if (url.pathname === "/callback") {
      return handleCallback(request, env);
    }

    return new Response("Decap CMS GitHub OAuth proxy. Use /auth to start login.", {
      status: 200,
    });
  },
};
