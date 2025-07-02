// perhaps globals for simplicity
let fileData = [] // everything, perhaps just name info for storage (creator,filename)

// Make maps
let flashCardList = []   // The list for studying
let tempListChange = []  // The list for changing

// Impliment with server
function getWordsDef() {
    // sends a request to the server to obtain the content of the file
    // return the data 
    return ["word":"definition", "word2":"definition2"... ] // hash map
}

function updataList() {
    // Make this happen server side 
    flashCardList = tempListChange;
}


function main() {
    // this is function that;s called on load

    // list = Get words/def


    /* If not list, show create-screen, else the study screen */
}