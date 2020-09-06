var status = document.getElementById('status');
var permStatus = 'Start editing';
document.getElementById('status').innerHTML = permStatus;


//-------------------- functions --------------------
function setPermStatus(text)
{
    permStatus = text;
    document.getElementById('status').innerHTML = text;
}

function setTempStatus(text)
{
    document.getElementById('status').innerHTML = text;
    setTimeout(() => {
        document.getElementById('status').innerHTML = permStatus;
    }, 2000);
}


//-------------------- socket events --------------------
socket.on('setTempStatus', function(text)
{
    setTempStatus(text);
})

socket.on('setPermStatus', function(text)
{
    setPermStatus(text);
})