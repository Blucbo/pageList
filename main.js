document.addEventListener("DOMContentLoaded", function() {
    // const querySettings = {
    //     filterBy: '',
    //     date: '',
    //     tags: []
    // };

    //global variable
    let state = [];

    const getDataAndRender = async () => {
        try {
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const request = new Request('https://api.myjson.com/bins/152f9j' , {
                method: 'GET',
                headers
            });
            const data = await (await fetch(request)).json();
            return data.data;
        } catch (err) {
            console.log(err)
        }
    };

    const renderItems = (state, firstIndex = 0, reset = false) => {
        const wrapper = document.querySelector('.wrapper-list');
        if (reset) {
            while (wrapper.firstChild) {
                wrapper.removeChild(wrapper.firstChild);
            }
        }
        wrapper.appendChild(getDoneList(state));

        // wrapper.appendChild(getDoneList(state.splice(firstIndex, 10)));
    };

    const applyFilter = (state, reset = false) => {
        switch(querySettings.filterBy) {
            case "date":
                renderItems(state.sort(sortDate), 0, reset);
                break;
            case "tags":
                renderItems(state.sort(cmfnTage), 0, reset);
                break;
        }
    };

    const sortDate = (a, b) => {
        const time1 = new Date(a.createdAt);
        const time2 = new Date(b.createdAt);
        if (querySettings.date === 'asc') {
            return  time1.getTime() - time2.getTime();
        } else {
            return  time2.getTime() - time1.getTime();
        }
    };

    const cmfnDescDate = (a, b) => {
        const time1 = new Date(a.createdAt);
        const time2 = new Date(b.createdAt);
        return  time2.getTime() - time1.getTime();
    };

    const cmfnTage = function (a, b) {
        const delta = b.tags.filter(howManyIncludeQuery).length - a.tags.filter(howManyIncludeQuery).length;
        if (delta === 0) {
            return cmfnDescDate(a, b);
        }
        return delta;
    };

    const setState = () => {
        getDataAndRender().then( data => {
            state = data;
            renderItems(data);
            setTemplateTab(querySettings);
            // applyFilter(state);
        });
    };


    const getTemplateCard = ({title, description, image, createdAt, tags}) => {
        const date = new Date(createdAt);
        return `<div class="item">
                    <h2 class="item-title">${title}</h2>
                    <p class="item-description">${description}</p>
                    <img class="item-photo" src="${image}" alt="">
                    <p class="item-createdAt"> ${date.getFullYear()} ${date.getHours()} ${date.getMinutes()}</p>
                    <span  class="item-tag">${tags}</span>
                </div>`
    };

    function getDoneList(arr) {
        const fragment = document.createDocumentFragment();
        arr.reduce(function(fragment, current) {
            const template = document.createElement('div');
            template.innerHTML = getTemplateCard(current);
            return fragment.appendChild(template);
        }, fragment);
        return fragment;
    }

    const howManyIncludeQuery = (value) => {
        const index = querySettings.tags.indexOf(value.toLowerCase());
        return index !== -1
    };

    const setTemplateSelectDate = value =>
        document.querySelector(`option[value=${value}]`).selected = true;

    const setTemplateCheckboxes = (...checkboxes) => {
        checkboxes.forEach(value => {
            console.log('v', value);
            const checkbox = document.querySelector(`#${value}`);
            checkbox.checked = true;
        });
    };

    const setTemplateTab = (settings) => {
        document.querySelector(`#${settings.filterBy}`).checked = true;
        switch(settings.filterBy) {
            case "date":
                setTemplateSelectDate(settings.date);
                break;
            case "tags":
                setTemplateCheckboxes(...settings.tags);
                break;
        }
        applyFilter(state, true);
    };

    const getDefaultSettings = () => {
        const defaultSettings= localStorage.getItem('defaultSettings');
        if (defaultSettings) {
            return JSON.parse(defaultSettings);
        } else {
            return ({
                filterBy: 'date',
                date: 'desc',
                tags: []
            });
        }
    };

    const querySettings = getDefaultSettings();
    setState();

    const selectDate = document.querySelector('#date-sort');
    selectDate.addEventListener('change', ({ target: { value }}) => {
        querySettings.date = value;
        applyFilter(state, true);
    });

    const tabCheckboxes = document.querySelectorAll("input[data-filter=saved]");
    tabCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener( 'change', function ({ target: { id }}) {
            if (this.checked) {
                querySettings.filterBy = id;
                applyFilter(state, true)
            }
        });
    });

    const filterCheckboxes = document.querySelectorAll("input[data-group=checkbox]");
    filterCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener( 'change', function ({ target: { id }}) {
            if (this.checked) {
                querySettings.tags.push(id)
            } else {
                const index = querySettings.tags.indexOf(id);
                querySettings.tags.splice(index, 1);
            }

            applyFilter(state, true);
            console.log('filter', querySettings);
        });
    });


    const inputSearch = document.querySelector('#search-input');

    inputSearch.addEventListener('keyup', ({ target: { value }}) => {
        console.log('ev targ', value);
        applySearchByTitle(value);
    }, false);



    window.addEventListener("beforeunload", function() {
        saveSettings(querySettings);
        console.log("SAVE", querySettings);
    });

    function saveSettings(options) {
        localStorage.setItem('defaultSettings', JSON.stringify(options));
    }
});
