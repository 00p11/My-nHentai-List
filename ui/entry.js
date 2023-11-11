let entry

class Entry {
    constructor(id, name, rating, before, after, notes, cover) {
        this.id = id
        this.name = name
        this.notes = notes
        this.rating = rating
        this.before = before
        this.after = after
        this.url = 'https://nhentai.net/g/' + id + '/'
        this.cover = cover
    }   
}

async function createArray() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['entries'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                alert("Error, please refresh the site.")
            } else {
                let found = false
                for (let i = 0; i < result.entries.length; i++) {
                    if (result.entries[i].id == getUrlSearchParams('id')) {
                        entry = new Entry(result.entries[i].id, result.entries[i].name, result.entries[i].rating, result.entries[i].before, result.entries[i].after, result.entries[i].notes, result.entries[i].cover)
                        found = true
                    }
                }
                if (found == false) {console.log('Entry not found. Make sure you dont cahnged the url.')}
                resolve();
            }
        })
    });
}

function getUrlSearchParams(key) {
    let params = new URL(document.location).searchParams;
    let result = params.get(key);
    return result;
}

async function createBody() {
    document.getElementById("cover").src = entry.cover;
}

async function init() {
    await createArray();
    await createBody();
};

init();