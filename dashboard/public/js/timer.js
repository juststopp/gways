setInterval(() => {
    console.log(giveaway)
    document.getElementById('timer').innerHTML = client.msToTime(giveaway.duration - (Date.now() - giveaway.datenow))
}, 1000)