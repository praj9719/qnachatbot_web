const express = require('express')
const app = express();
const fs = require('fs')

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
const url = "http://35.188.169.72:5000/";

const homeFile = fs.readFileSync("index.html", "utf-8");

myBots = [
    {"name": "Wikipedia", "value": "vishwakosh"},
    {"name": "SSC Science", "value": "ssc_science"},
    {"name": "SSC History", "value": "ssc_history"},
];

myLangs = [
    {"name": "English", "value": "en"},
    {"name": "Same", "value": "same"},
    {"name": "Marathi", "value": "mr"},
    {"name": "Hindi", "value": "hi"},
]

const updateFile = (file, data, selectedBot=myBots[0]['value'], selectedLang=myLangs[0]['value'], query="") => {
    let newHtml = "";
    data.forEach(ans => {
        newHtml += `
        <div class="col-md-6">
            <div class="card">
                <p class="short_ans">${ans.short}</p>
                <p style="border: 0.1px solid #eee; margin: 0 20px;">
                <p class="long_ans">${ans.long}</p>
            </div>
        </div>
        `
    });

    let botOptions = "";
    let bot = myBots[0];
    if (bot['value'] == selectedBot) botOptions+=`<option value="${bot['value']}" selected="selected">${bot['name']}</option>\n`
    else botOptions+=`<option value="${bot['value']}">${bot['name']}</option>\n`
    for (let i = 0; i < myBots.length; i++) {
        bot = myBots[i];
        if (bot['value'] == selectedBot) botOptions+=`<option value="${bot['value']}" selected="selected">${bot['name']}</option>\n`
        else botOptions+=`<option value="${bot['value']}">${bot['name']}</option>\n`
    }    

    let langOptions = "";
    let lang = myLangs[0];
    if (lang['value'] == selectedLang) langOptions+=`<option value="${lang['value']}" selected="selected">${lang['name']}</option>\n`
    else langOptions+=`<option value="${lang['value']}">${lang['name']}</option>\n`
    for (let i=0; i < myLangs.length; i++){
        lang = myLangs[i];
        if (lang['value'] == selectedLang) langOptions+=`<option value="${lang['value']}" selected="selected">${lang['name']}</option>\n`
        else langOptions+=`<option value="${lang['value']}">${lang['name']}</option>\n`
    }

    let newFile = file.replace("{%Answers%}", newHtml);
    newFile = newFile.replace("{%select_bot_options%}", botOptions)
    newFile = newFile.replace("{%select_lang_options%}", langOptions)
    newFile = newFile.replace("{%input_value%}", query)
    return newFile;
}

app.get('/', (req, res) => {
    res.send(updateFile(homeFile, []));
    res.end();
});

app.post('/', (req, res)=>{
    var query = req.body.searchbox
    let bot = req.body.select_bot
    let lang = req.body.select_lang
    let boturl = url+bot;
    xhr.open("POST", boturl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const qnaresponse = JSON.parse(xhr.responseText);
            if (qnaresponse.data != null && qnaresponse.data.message != null){
                const answers = qnaresponse.data.message;
                res.send(updateFile(homeFile, answers, bot, lang, query));
                res.end();
            }else console.log("Null response");
        }
    };
    var data = JSON.stringify(
        {
            "query": query,
            "out_lang": lang
        }
    );
    xhr.send(data);  
})



const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is listeing on port ${PORT}`);
});