var fontsize = 1.35;
var pagelink = 'liveclip.herokuapp.com?id=' + id;
document.getElementById('sharelink').innerHTML = pagelink;
document.getElementById('qrimage').src = 'https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=' + encodeURI('https://' + pagelink);

function fontincr() {
    if (fontsize < 2.15) {
        fontsize += 0.2;
        document.getElementById('notepad').style.fontSize = fontsize + 'em';
    }
}

function fontdecr() {
    if (fontsize > 0.55) {
        fontsize -= 0.2;
        document.getElementById('notepad').style.fontSize = fontsize + 'em';
    }
}

function copytext() {
    navigator.clipboard.writeText(document.getElementById('notepad').value)
        .then(
            () => {
                document.querySelector('#copybtn > img').src = 'media/tick.png';
                setTimeout(() => {
                    document.querySelector('#copybtn > img').src = 'media/copy.png';
                }, 1000);
            },
            (error) => {
                console.log(error);
            }
        )
}

var unnamedcount = 0;
function saveversion() {
    let versionname = prompt('Please enter a name for this version.');
    if (versionname === '') {
        unnamedcount++;
        versionname = 'Unnamed ' + unnamedcount;
    }
    let msg = { 'versionname': versionname, 'text': document.getElementById('notepad').value };
    socket.emit('sendTempStatus', `${username} saved the current version as ${versionname}.`)
    socket.emit('newsave', msg);
}

function restoreversion(versionname) {
    let choice = confirm('This will replace the current text with that of ' + versionname + '.');
    if (choice) {
        document.getElementById('notepad').value = versiondb[versionname];
        setTimeout(() => {
            socket.emit('sendPermStatus', `${username} has restored the version ${versionname}.`)
        }, 500);
    }
}

function copylink() {
    navigator.clipboard.writeText('https://' + pagelink)
        .then(
            () => {
                document.querySelector('#linkcopy > img').src = 'media/tick.png';
                setTimeout(() => {
                    document.querySelector('#linkcopy > img').src = 'media/copy.png';
                }, 1000);
            },
            (error) => {
                console.log(error);
            }
        )
}

async function opensharedialogue() {
    let shareobj = {
        'title': 'LiveClip invitation',
        'text': (`${username} is inviting you to join this liveclip: \n`),
        'url': ('https://' + pagelink)
    }

    if (navigator.share() !== 'undefined')
        await window.navigator.share(shareobj);
    else
        alert('Sharing not supported yet.');
}