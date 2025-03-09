function askChatbot() {
    const name = document.getElementById("player-name").value;
    fetch(apiUrl + `/chatbot/player/${name}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("chatbot-response").innerText = JSON.stringify(data);
        });
}
