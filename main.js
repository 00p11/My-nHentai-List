// On load message
console.log("Extension My nHentai List loaded")

// Class for temporary sotring entry propeties
var curentEntry

class Entry {
    constructor(id, name, before, after) {
        this.id = this.getId()
        this.name = this.getName()
        this.before = this.getBefore()
        this.after = this.getAfter()
    }

    actualizateProperties() {
        this.id = this.getId()
        this.name = this.getName()
        this.before = this.getBefore()
        this.after = this.getAfter()
    }

    async saveEntry() {
        this.getBefore()
        const isDuplicate = await checkDuplicate(this.id);
        if (!isDuplicate) {
            saveEntry(this.id, this.name, this.before, this.after)
        } else {
            console.log('Duplicate')
        }
    }

    getId() {
        const element = document.getElementById("gallery_id");
        const textContent = element.textContent;
        const regex = /\d+/;
        const number = textContent.match(regex)[0];
        return number;
    }

    getName() {
        const titleElem = document.querySelector('.title .pretty');
        const titleText = titleElem.textContent;
        return titleText;
    }

    getBefore() {
        const titleElement = document.querySelector('.title');
        const beforeElement = titleElement.querySelector('.before');
        const before = beforeElement.textContent.trim();
        return before;
    }

    getAfter() {
        const titleElement = document.querySelector('.title');
        const afterElement = titleElement.querySelector('.after');
        const after = afterElement.textContent.trim();
        return after;
    }
}

// Functions

async function saveEntry(id, name, before, after) {
    if (id != undefined || name != undefined) {
        chrome.storage.local.get(['entries'], function (result) {
            if (result.entries) {
                result.entries.push({ id: id, name: name, before: before, after: after })
            } else {
                result.entries = [{ id: id, name: name, before: before, after: after }]
            }
            chrome.storage.local.set({ entries: result.entries }, function () {
                console.log("Data saved (id: " + id + ", name: " + name + ", before: " + before + ", after: " + after + ")")
            })
        })
    }
}

async function checkDuplicate(id) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['entries'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                alert("Error, please refresh the site.")
            } else {
                for (let i = 0; i < result.entries.length; i++) {
                    if (result.entries[i].id == id) {
                        resolve(true);
                    }
                }
                resolve(false);
            }
        })
    });
}

async function getEntries() {
    chrome.storage.local.get(['entries'], function (result) {
        console.log(result.entries)
    })
}

async function deleteEntries() {
    chrome.storage.local.remove(['entries'], () => {
        console.log('Removed')
    })
}

// Key bindings
addEventListener('keydown', (e) => {
    if (e.key === "n") { curentEntry.saveEntry() }
    if (e.key === "m") { getEntries() }
})

// Init function that creates a temporary object for the entry
function init() {
    curentEntry = new Entry
}

init()