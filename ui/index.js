// Becouse of chrome extension limitation, only aproximatly 55000 entries can be stored at once
let entries = []

class Entry {
    constructor(id, name, rating, before, after) {
        this.id = id
        this.name = name
        this.rating = rating
        this.before = before
        this.after = after
        this.url = 'https://nhentai.net/g/' + id + '/'
        this.row = this.createRow()
    }

    createRow() {
        // Row
        const row = document.createElement('div')
        row.setAttribute('class', 'row')
        // Cells
        const idCell = document.createElement('div')
        const nameCell = document.createElement('div')
        const ratingCell = document.createElement('div')
        const removeBtnCell = document.createElement('div')
        idCell.setAttribute('class', 'cell')
        nameCell.setAttribute('class', 'cell')
        ratingCell.setAttribute('class', 'cell')
        removeBtnCell.setAttribute('class', 'cell')
        row.appendChild(idCell)
        row.appendChild(nameCell)
        row.appendChild(ratingCell)
        row.appendChild(removeBtnCell)
        // Text inside cells
        const id = document.createElement('a')
        const before = document.createElement('a')
        const name = document.createElement('p')
        const after = document.createElement('a')
        const rating = document.createElement('input')
        id.textContent = this.id
        id.setAttribute('href', this.url)
        id.setAttribute('id', 'id')
        id.setAttribute('target', "_blank")
        before.setAttribute('class', 'nameBefore')
        after.setAttribute('class', 'nameAfter')
        before.textContent = this.before + " "
        after.textContent = " " + this.after
        name.appendChild(before)
        const nameText = document.createTextNode(this.name)
        name.appendChild(nameText)
        name.appendChild(after)
        nameCell.appendChild(name)
        idCell.appendChild(id)
        // Rating
        rating.textContent = this.rating
        rating.setAttribute('class', 'rating')
        rating.setAttribute('type', 'number')
        rating.setAttribute('min', '1')
        rating.setAttribute('max', '10')
        rating.setAttribute('value', this.rating)
        if (this.rating == undefined) { rating.setAttribute('class', 'nonRated rating') }
        rating.addEventListener("blur", () => { this.saveRating(rating.value); console.log(rating.value) })
        rating.addEventListener("keypress", (event) => { if (event.key === "Enter") { this.saveRating(rating.value) } })
        ratingCell.appendChild(rating)
        // Remove button
        const removeBtn = document.createElement('a')
        removeBtn.setAttribute('class', 'removeBtn')
        removeBtn.textContent = 'Remove'
        removeBtn.addEventListener('click', () => this.removeEntry())
        removeBtnCell.appendChild(removeBtn)
        return row;
    }

    displayRow() {
        const list = document.getElementById('list')
        list.appendChild(this.row)
    }

    removeRow() {
        this.row.remove()
    }

    removeEntry() {
        removeEntry(this.id)
    }

    saveRating(rating) {
        if (rating) {
            if (rating > 10) { rating = 10 }
            if (rating < 1) { rating = 1 }
        }
        this.rating = rating
        chrome.storage.local.get(['entries'], (result) => {
            for (let i = 0; i < result.entries.length; i++) {
                if (result.entries[i].id == this.id) {
                    result.entries[i].rating = this.rating
                }
            }
            chrome.storage.local.set({ 'entries': result.entries }, () => {
                console.log("Rating saved sucesfully: (" + this.rating + ")")
                console.log(result.entries)
                location.reload()
            })
        })
    }
}

async function createArray() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['entries'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                alert("Error, please refresh the site.")
            } else {
                for (let i = 0; i < result.entries.length; i++) {
                    entries.push(new Entry(result.entries[i].id, result.entries[i].name, result.entries[i].rating, result.entries[i].before, result.entries[i].after))
                }
                resolve();
            }
        })
    });
}

async function removeEntry(id) {
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].id == id) {
            entries[i].removeRow()
            entries.slice(i)
        }
    }
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['entries'], (result) => {
            console.log(result.entries)
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                for (let i = 0; i < result.entries.length; i++) {
                    console.log(result.entries[i].id)
                    if (result.entries[i].id == id) {
                        console.log('Match: ' + result.entries[i].id)
                        result.entries.splice(i, 1)
                    }
                }
                chrome.storage.local.set({ entries: result.entries }, () => {
                    console.log('Removed entries with id ' + id)
                })
                console.log(result.entries)
                resolve()
            }
        })
    })
}

function displayList() {
    for (let i = 0; i < entries.length; i++) {
        entries[i].displayRow()
    }
}

async function init() {
    try {
        await createArray()
        for (let i = 0; i < entries.length; i++) {
            entries[i].displayRow()
        }
    } catch {
        location.reload()
    }
}

async function getChromeStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            console.log(result.entries)
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key])
            }
        })
    })
}

// Event listeners because of some stupid rules
document.getElementById('logo').addEventListener('click', () => { window.location.href = 'https://nhentai.net/' })

const exportBtn = document.getElementById('exportBtn')
exportBtn.addEventListener('click', exportInFile)

const impoerBtn = document.getElementById('importBtn')
impoerBtn.addEventListener('click', importFromFile)

// Visibility of after and before
let visible = true;

const showHideBeforeAfter = document.getElementById('showHideBeforeAfter');

addEventListener('load', () => {
    chrome.storage.local.get(['visible'], (result) => {
        console.log(result.visible);
        visible = result.visible;
        if (result.visible == false) {
            console.log("asdasd")
            const nameBeforeAfterQ = document.querySelectorAll('.nameBefore, .nameAfter');
    
            for (let i = 0; i < nameBeforeAfterQ.length; i++) {
                nameBeforeAfterQ[i].classList.add('hidden')
                console.log(nameBeforeAfterQ[i])
    
            }
            showHideBeforeAfter.innerHTML = 'Show before and after'
        }
    });
})


showHideBeforeAfter.addEventListener('click', () => {
    const nameBeforeAfterQ = document.querySelectorAll('.nameBefore, .nameAfter');

    switch (visible) {
        case true:
            visible = false;
            for (let i = 0; i < nameBeforeAfterQ.length; i++) {
                nameBeforeAfterQ[i].classList.add('hidden')

            }
            showHideBeforeAfter.innerHTML = 'Show before and after'
            chrome.storage.local.set({ 'visible': visible }, () => { });
            return;
        case false:
            visible = true;
            showHideBeforeAfter.innerHTML = 'Hide before and after'
            for (let i = 0; i < nameBeforeAfterQ.length; i++) {
                nameBeforeAfterQ[i].classList.remove('hidden')
            }
            chrome.storage.local.set({ 'visible': visible }, () => { });
            return;
    }
});

// Export / Import
async function exportInFile() {
    let entries = await getChromeStorage('entries')
    let textToSave = ""
    for (let i = 0; i < entries.length; i++) {
        textToSave += JSON.stringify(entries[i]) + "\n"
    }
    let hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/plain;charset=utf-8," + encodeURIComponent(textToSave);
    hiddenElement.target = "_blank";
    hiddenElement.download = "MnHL-export.mnhl";
    hiddenElement.click();
}

function importFromFile() {
    try {
        let hiddenElement = document.createElement("input");
        hiddenElement.setAttribute('type', 'file')
        hiddenElement.setAttribute('id', 'fileInput')
        hiddenElement.setAttribute('accept', '.mnhl')
        hiddenElement.click()
        hiddenElement.addEventListener('change', () => {
            const file = hiddenElement.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                const fileContent = reader.result
                const arr = fileContent.trim().split('\n').map(line => JSON.parse(line));
                console.log(arr)
                chrome.storage.local.set({ 'entries': arr }, () => {
                    console.log("Import sucesfull. (imported " + arr.length + " entries)")
                    location.reload()
                })
            }
        })
    } catch (err) {
        alert('ERR: File is empty or corupted.')
    }
}

init()