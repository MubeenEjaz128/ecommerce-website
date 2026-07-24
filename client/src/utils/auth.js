import { setAccessToken } from "../features/ui/uiSlice";

export async function refreshToken(dispatch, getState) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      dispatch(setAccessToken(""));
      return null;
    }

    const payload = await response.json();
    const accessToken = payload?.data?.accessToken || payload?.accessToken || "";
    if (!accessToken) {
      dispatch(setAccessToken(""));
      return null;
    }
    dispatch(setAccessToken(accessToken));
    return { accessToken, state: getState() };
  } catch (err) {
    // Network error or server down
    dispatch(setAccessToken(""));
    return null;
  }
}