var Cookies = new Cookie();
let timers = {};

const httpGet = async (url, widget, id, disableProxy) => {
    // Usage of a proxy because of CORS Policy
    const response = await fetch((!disableProxy ? "https://cors-anywhere.herokuapp.com/" : "") + url, {
        method: 'GET',
        redirect: 'follow',
    });
    if (!response || !response.ok) {
        let style = 'color: red; font-weight: bold; font-size: 16px';
        widget.innerHTML = "<a class='modal-trigger' href='#modal" + id + "' style='" + style + "'>Can't retrieve information from URL, please make sure it's correct.</a>";
        return false;
    }
    return response;
};

const parseXML = (xml) => {
    let parser, xmlDoc;

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml,"text/xml");
    } else  {
        // Internet Explorer
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xml);
    }
    return (xmlDoc);
}

const getParam = (params, name) => {
    let found = false;

    params.forEach(element => {
        if (element.name === name)
            found = element;
    });
    return found;
};

const updateWidget = async (widget) => {
    let split = widget.id.split('-');
    let id = split.pop();
    let name = split.pop().toLowerCase();
    let params = await Cookies.getCookie('widget-' + id + '-' + name + '-params');
    let timer = await Cookies.getCookie('widget-' + id + '-' + name + '-timer');
    if (params.length == 0 || timer.length == 0) {
        widget.innerHTML = "Please configure this widget to use it.";
        document.getElementById("refresh" + id).innerHTML = '';
        return;
    }
    let obj = JSON.parse(params);
    let endpoint = widget.getAttribute('data-endpoint');

    let isValid = true;
    obj.forEach(element => {
        if (element.value.length == 0)
            isValid = false;
        document.getElementById("modal" + id + "-param" + element.id).value = element.value;
    });
    if (params.length == 0 || !isValid || timer.length == 0) {
        widget.innerHTML = "Please configure this widget to use it.";
        document.getElementById("refresh" + id).innerHTML = '';
        return;
    }

    document.getElementById("modal" + id + "-timer").value = timer;
    document.getElementById("refresh" + id).innerHTML = timer.toString() + 's';
    // Widgets
    if (name === "weather") {
        let city = getParam(obj, "city");
        let request = await httpGet(endpoint + "&q=" + city.value, widget, id);
        if (!request)
            return;
        let answer = await request.json();
        widget.innerHTML = "It's " + answer['main']['temp'] + "°C in " + city.value;
    } else if (name == "rss") {
        let url = getParam(obj, "url");
        let request = await httpGet(url.value, widget, id);
        if (!request)
            return;
        let answer = await request.text();
        let xml = parseXML(answer);
        let rssItems= xml.getElementsByTagName("item");
        widget.innerHTML = "";
        if (rssItems.length > 0) {
            for (let i = 0; i < rssItems.length; i++) {
                let curHeadline = rssItems[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                let curLink = rssItems[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
                let curDesc = rssItems[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
                let card = "<div>";
                let curItem = card + "<a href='" + curLink + "' style='font-weight: 600'>" + curHeadline + "</a><br/>";

                curItem +=  curDesc + "<br/>";
                card += curItem;
                card += "<div class='divider' style='margin-top: 8px; margin-bottom: 8px'></div></div>"
                widget.innerHTML += card;
            }
        }
    } else if (name === "subreddits") {
        let url = getParam(obj, "reddit_name")
        let request = await httpGet(endpoint + url.value + "/new.json?limit=20", widget, id);
        if (!request)
            return;
        let answer = await request.json();
        widget.innerHTML = "";
        for (let i = 0; i < answer.data.children.length; i++) {
            let title = document.createElement("div")
            let time = document.createElement("div")
            let img = document.createElement("img")

            // title
            title.innerHTML = answer.data.children[i].data.title
            title.classList.add('reddit-tile');
            widget.appendChild(title)
            // time
            let date = new Date(answer.data.children[i].data.created_utc * 1000)
            time.innerHTML = date.toDateString()
            time.innerHTML += " at " + date.getHours() + ":" + date.getMinutes()
            time.style = "color: gray;";
            widget.appendChild(time)
            // img
            img.setAttribute("src", answer.data.children[i].data.thumbnail)
            img.setAttribute("alt", "reddit post from " + answer.data.children[i].data.author)
            img.classList.add("thumbnail-reddit")
            widget.appendChild(img)
        }
    } else if (name === "chucknorris") {
        let url = getParam(obj, "category")
        let request = await httpGet(endpoint + url.value, widget, id);
        if (!request)
            return;
        let answer = await request.json();
        widget.innerHTML = "";
        let parent = document.createElement('div')
        let joke = document.createElement("div")
        let icon = document.createElement("img")

        // parent div
        parent.classList.add("fl")
        parent.classList.add("chuck-norris")

        // icon div
        icon.setAttribute("src", answer.icon_url)
        icon.setAttribute("alt", "chuck norris joke")
        parent.appendChild(icon)

        // joke div
        joke.innerHTML = answer.value
        parent.appendChild(joke)
        widget.appendChild(parent)
    } else if (name === "recipe") {
        let url = getParam(obj, "ingredient")
        let request = await httpGet(endpoint + url.value, widget, id);
        if (!request)
            return;
        let answer = await request.json();
        widget.innerHTML = "";
        for (let i = 0; i < answer.length; i++) {
            let title = document.createElement("div")
            let otherIngredients = document.createElement("ul")
            let img = document.createElement("img")
            let parent = document.createElement("div")

            // title
            title.innerHTML = answer[i].title
            title.classList.add('reddit-tile');
            parent.appendChild(title)

            // otherIngredients
            if (answer[i].missedIngredientCount > 0) {
                let titleOtherIngredients = document.createElement("div")

                titleOtherIngredients.innerHTML = "Others ingredients: "
                parent.appendChild(titleOtherIngredients)
            }
            for (let j = 0; j < answer[i].missedIngredientCount; j++) {
                let otherIngredient = document.createElement("li")

                otherIngredient.innerHTML = "- " + answer[i].missedIngredients[j].name
                otherIngredients.appendChild(otherIngredient)
            }
            parent.appendChild(otherIngredients)

            // img
            img.setAttribute("src", answer[i].image)
            img.setAttribute("alt", "recipe for " + answer[i].title)
            parent.appendChild(img)
            parent.classList.add("recipe")
            widget.appendChild(parent)
        }
    } else if (name === "epitech profile") {
        let autologin = getParam(obj, "autologin URL");
        const response = await fetch('/widgets/intranet/profile', {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({autologin: autologin.value})
        });
        if (!response || !response.ok) {
            let style = 'color: red; font-weight: bold; font-size: 16px';
            widget.innerHTML = "<a class='modal-trigger' href='#modal" + id + "' style='" + style + "'>Can't retrieve information from URL, please make sure it's correct.</a>";
            return false;
        }
        let answer = await response.json();
        widget.innerHTML = "";
        let title = document.createElement("div");
        title.style = "text-align: center"
        title.innerHTML += "<h6>" + answer.title + " </h6>";
        title.innerHTML += "<p><b> Tek " + answer.studentyear +  "</b> from <b>" + answer.groups[0].title + "</b></p>";
        title.innerHTML += "<p><b>Promo:</b> " + answer.promo + "</p>";
        title.innerHTML += "<p>Your <b>GPA</b> is: " + answer.gpa[0].gpa + "</p></div>";
        widget.appendChild(title);
    } else if (name === "epitech planning") {
        let autologin = getParam(obj, "autologin URL");
        let end = getParam(obj, "end date");
        if (end.type === "number") {
            if (!Number.isInteger(end.value)) {
                let style = 'color: red; font-weight: bold; font-size: 16px';
                widget.innerHTML = "<a class='modal-trigger' href='#modal" + id + "' style='" + style + "'>Can't retrieve information from URL, please make sure it's correct.</a>";
                return false;
            }
        }
        const response = await fetch('/widgets/intranet/planning', {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({autologin: autologin.value, end: end.value})
        });
        if (!response || !response.ok) {
            let style = 'color: red; font-weight: bold; font-size: 16px';
            widget.innerHTML = "<a class='modal-trigger' href='#modal" + id + "' style='" + style + "'>Can't retrieve information from URL, please make sure it's correct.</a>";
            return false;
        }
        let answer = await response.json();
        if (answer.error) {
            widget.innerHTML = answer.message;
            return;
        }
        widget.innerHTML = "";
        let parent = document.createElement('div');
        parent.style = "text-align: center";
        let today = new Date();
        let endDate = new Date(today);
        endDate.setDate(endDate.getDate() + parseInt(end.value));
        let added = false;
        answer.forEach(element => {
            let match = element['end'].match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
            let endElementDate = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

            if (element['event_registered'] === "registered" && endElementDate < endDate) {
                added = true;
                let diff = new Date(endElementDate.getTime() - today.getTime());
                let eventDiv = document.createElement('div');
                eventDiv.innerHTML = "<h6><b>" + element['acti_title'] + "</b> in <b>" + diff.getUTCDate() + "</b> days</h6>";
                let url = element['scolaryear'] + "/" + element["codemodule"] + "/" + element["codeinstance"] + "/" + element["codeacti"] + "/"
                eventDiv.innerHTML += "<p><a href='https://intra.epitech.eu/module/" + url + "' style='font-size: 16px'>Click HERE to view it on intra.epitech.eu</a></p>";
                parent.appendChild(eventDiv);
            }
        });
        if (!added) {
            parent.innerHTML = "No events inconming for the next " + end.value + " days.";
        }
        widget.appendChild(parent);
    }
    if (!timers[id])
        timers[id] = setInterval(updateWidgetWithParams, timer * 1000, name, id);
};

const setWidgetParams = (id, name, paramsStr) => {
    let params = JSON.parse(paramsStr).data;
    params.forEach(element => {
        let input = document.getElementById('modal' + id + '-param' + element.id);
        element.value = input.value;
    });
    let timer = document.getElementById('modal' + id + '-timer').value;
    if (timer < 10 || timer > 999)
        timer = 10;
    Cookies.setCookie('widget-' + id + '-' + name.toLowerCase() + '-timer', timer);
    Cookies.setCookie('widget-' + id + '-' + name.toLowerCase() + '-params', JSON.stringify(params));

    updateWidgetWithParams(name.toLowerCase(), id);
};

const updateWidgetWithParams = (name, id) => {
    let widget = document.getElementById("widget-content-" + name.toLowerCase() + '-' + id);
    let timer = Cookies.getCookie('widget-' + id + '-' + name + '-timer');

    if (!timer || timer.length == 0) {
        widget.innerHTML = "Please set a timer.";
        return;
    }
    widget.innerHTML = "<div class='progress'><div class='indeterminate'></div></div>";
    updateWidget(widget);
    if (timers[id])
        clearTimeout(timers[id]);
    timers[id] = setInterval(updateWidgetWithParams, timer * 1000, name, id);
};

document.addEventListener('DOMContentLoaded', function() {
    let widgetsContents = document.querySelectorAll('*[id^="widget-content-"]');

    widgetsContents.forEach(widget => {
        updateWidget(widget);
    });
    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems, {
        'preventScrolling': true
    });
    var el = document.getElementById("items");
    var sortable = Sortable.create(el, {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)",
        onChange: function (evt) {
            // @TODO: SAVE IN COOKIES THE SORT
            // console.log(evt.item);
            // console.log(evt.from);
            // console.log(evt.newIndex);
        },
    });
 }, false);