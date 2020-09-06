//-------------------- initializing globals --------------------
function getParameterByName(name, url)//gets variable values from URL's query params
{
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var isOwner = 0;
var versiondb = {};
var id = getParameterByName('id');
var d = new Date();
var username = prompt('Enter a display name, it will be visible to other users connected to this liveclip.')
if(username === null || username === '') username = 'user'+d.getSeconds().toString();//Random username if user does not enter one
var lastver = ''
document.getElementById('userlist').innerHTML += `<li>${username}</li>`


if(id === 'undefined' || id == null)//generates a random room id based on time, if id is not specified in URL
{
    isOwner = 1;
    id =''
    id = d.getHours().toString()+d.getMinutes().toString()+d.getSeconds().toString()+d.getDate().toString();
    document.getElementById('ownername').innerHTML = username;
}
console.log('RoomID: '+id);
console.log('Username: '+username);

var notepad = document.getElementById('notepad');
var socket = io();


//-------------------- socket events --------------------
socket.on('connect', function(){
    socket.emit('joinroom',id);
    let msg = {'username': username, 'roomid': id};
    if(isOwner) socket.emit('tellowner', msg);
    socket.emit('joinusers', msg);

    setTimeout( () => {
        socket.emit('getusers','')
    }, 500)
});

socket.on('updatetext', function(text)
{
    lastver = text;
    notepad.value = text;
})

socket.on('updateowner' ,function(ownername)
{
    document.getElementById('ownername').innerHTML = ownername;
})

socket.on('updateusers', function(users)
{
    console.log(users);
    let count = 0;
    document.getElementById('userlist').innerHTML = '';
    for(name in users)
    {
        if(users[name] !== '')
        {
            document.getElementById('userlist').innerHTML += `<li>${users[name]}</li>`
            count++;
        }
    }
    document.getElementById('userno').innerText = count;
})

socket.on('updateversions', function(versions)
{
    versiondb = versions;
    document.getElementById('popupwrapper').innerHTML = '';
    for (version in versions)
    {
        document.getElementById('popupwrapper').innerHTML += `<div class="versionname" onclick = "restoreversion('${version}')">${version}</div>`;
    }
});


//-------------------- utility functions --------------------
function sendtext(notepadval)//sends updated text value to server
{
    let msg = {};
    msg.text = notepadval;
    msg.roomid = id;
    socket.emit('changedtext', msg);

    let d = new Date();
    let time = '';
    if(d.getHours() > 12) time = (d.getHours() %12) + ':' + d.getMinutes() + 'PM';
    else time = d.getHours() + ':' + d.getMinutes() + 'AM';
    socket.emit('sendPermStatus', `Last modified by ${username} at ${time}.`);
}

function check()//checks if user has edited the text in notepad every 100ms
{
    if(lastver !== notepad.value)
    {
        lastver = notepad.value;
        sendtext(lastver);
    }
}
setInterval(check, 100);