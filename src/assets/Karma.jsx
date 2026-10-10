import axios from "axios";
import { toast } from "sonner";
//import { refresh_token, logout } from "../redux/actions/auth";//refresh_token, logout functions are yetto be created


import Cookies from "js-cookie";
//axios.defaults.withCredentials=true

export const getHost = () => {
  // 1) Explicit override, e.g. VITE_API_URL=http://localhost:8000/ in .env.local
  const override = import.meta.env.VITE_API_URL;
  if (override) return override.endsWith("/") ? override : override + "/";

  // 2) Dev machine or local network (localhost, 127.0.0.1, 10.x, 172.16-31.x, 192.168.x):
  //    talk to the Django dev server on port 8000 of the same host.
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (isLocal) return `http://${host}:8000/`;

  // 3) Deployed site
  return `https://uwbrain-216941414590.asia-south1.run.app/`;
};


function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const fireAjax = async (context) => {
  console.log("Hello from fireAjax");
  console.log("fireAjax context=", context);
  let { method, url, body, callBack, pure, responseType } = context;

  let access = `JWT ${localStorage.getItem("ResumeXp_access")}`; // static
  // //var csrftoken = Cookies.get('csrftoken');
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: access,
      Accept: "application/json",
      "X-CSRFToken": Cookies.get("csrftoken"), //required?
      //"X-CSRFToken": getCookie("csrftoken")
    },
  };


  try {
    let result;
    switch (method) {
      case "patch":
        result = await axios.patch(url, body, config);
        break;
      case "post":
        result = await axios.post(url, body, config);
        break;
      case "get":
        result = await axios.get(url, {
          ...config,
          params: body,
          responseType: responseType,
        });
        break;
      case "put":
        result = await axios.put(url, body, config);
        break;
      case "delete":
        result = await axios.delete(url, body, config);
        break;
      case "head":
        result = await axios.head(url, body, config);
        break;
      case "options":
        result = await axios.options(url, body, config);
        break;
      default:
        result = await axios.post(url, body, config);
        break;
    }
    console.log("result =>", result);
    // here trying to do something like  -   let result = await axios({ method:method, url:url, body:body, config:config }); // Dynamic changing to patch / post / anything
    callBack(result);
  } catch (error) {
    console.log("error=", error);
    // Surface the failure instead of leaving the page stuck on "Processing..."
    const status = error?.response?.status;
    const detail = error?.response?.data?.error;
    toast.error(
      status === 429
        ? "The AI service is busy. Please wait a minute and try again."
        : detail || "Something went wrong. Please try again."
    );
    if (context.onError) context.onError(error);
  }
};


