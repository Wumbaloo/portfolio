class Cookie {
    constructor() {}

    getCookie(name) {
        if (document.cookie.length > 0) {
            var c_start = document.cookie.indexOf(name + "=");
            if (c_start != -1) {
                c_start = c_start + name.length + 1;
                var c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
              }
               return unescape(document.cookie.substring(c_start, c_end));
           }
       }
       return "";
    }

    setCookie(name, value, expiredays) {
        let exdate = new Date();
       exdate.setDate(exdate.getDate() + expiredays);
       document.cookie = name + "=" + escape(value) + ((expiredays == null) ? "" : "; expires=" + exdate.toUTCString());
    }
};

var Cookies = new Cookie();

const addClass = (idElem, className) => {
    let elem = document.getElementById(idElem);

    if (elem.classList.contains(className))
        elem.classList.remove(className);
    else
        elem.classList.add(className);
}

const cookiesAccepted = () => {
    addClass("banderoll-cookies", 'hidden');
    Cookies.setCookie("Cookies-accepted", "true", 24);
}

const subscribe = (serviceName) => {
    Cookies.setCookie(serviceName, "", -1);
    Cookies.setCookie(serviceName, "true", 24);
}

const unsubscribe = (serviceName) => {
    Cookies.setCookie(serviceName, "", -1);
    Cookies.setCookie(serviceName, "false", 24);
}

async function onSignIn(googleUser) {
    let id_token = googleUser.getAuthResponse().id_token

    const response = await fetch("http://localhost:8080/user/oauth/google", {
         method: 'POST',
         headers: {"Content-Type": 'application/json'},
         body: JSON.stringify({
             "id_token": id_token,
         })
    }).catch(err => console.log(err))
    window.location = "http://localhost:8080/dashboard";
    Cookies.setCookie("isOauthGoogle", "true", 24)
}

let signInOffice = undefined;

if (typeof Msal !== 'undefined') {
    const msalConfig = {
        auth: {
            clientId: 'ea7f266d-667c-4ff1-a921-bfec1f15f324'
        }
    };

    var loginRequest = {
        scopes: ["user.read", "mail.send"] // optional Array<string>
    };

    const msalInstance = new Msal.UserAgentApplication(msalConfig);

    signInOffice = async (event, login) => {
        let response = await msalInstance.loginPopup(loginRequest)

        if (!login) {
            let answer = await fetch("http://localhost:8080/user/oauth/microsoft", {
                    method: 'POST',
                    headers: {"Content-Type": 'application/json'},
                    body: JSON.stringify({
                        'id_token': response.account.accountIdentifier,
                        'name': response.account.name,
                        'email': response.account.userName,
                    })
            });
            window.location = "/dashboard";
            Cookies.setCookie("isOauthMicrosoft", "true", 24)
        } else {
            window.location = "/service/subscribe/" + login;
        }
    };

    let officeSignIn = document.getElementById('office-sign-in');
    if (officeSignIn) {
        officeSignIn.addEventListener("click", signInOffice);
    }
}

const subscribeService = (id, name, subscribed) => {
    if (name.indexOf('Intranet Epitech') === -1 || subscribed)
        window.location = "/service/subscribe/" + id;
    if (signInOffice) {
        signInOffice(false, id);
    }
};