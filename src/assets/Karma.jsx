import axios from "axios";
//import { refresh_token, logout } from "../redux/actions/auth";//refresh_token, logout functions are yetto be created


import Cookies from "js-cookie";
//axios.defaults.withCredentials=true

export const getHost = () => {
  let hosturl;
  if (window.location.hostname.includes("localhost")) {
    //console.log("host: localhost");
    hosturl = `https://uwbrain-216941414590.asia-south1.run.app/`//`http://localhost:8000/`;
  } else {
    //console.log("host: resumexp");
    hosturl = `https://uwbrain-216941414590.asia-south1.run.app/`//"http://localhost:8000/"; //`https://www.resumexp.com/`;
  }
  //hosturl = `https://www.resumexp.com/`;
  //hosturl = `https://resumexp-api-216941414590.asia-south1.run.app/`;
  return hosturl;
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
  }
};


