let players = [];

/**
 * 플레이어 생명끈 : (게임 매칭 요청) ~ (해당 게임 종료)
 */

function getPlayerById(id) {
    return players.find((player) => player.id === id);
}

function getPlayerByConnection(connection) {
    return players.find((player) => player.connection === connection);
}

function addPlayer(player) {
    players.push(player);
}

function removePlayer(id) {
    players = players.filter((player) => player.id !== id);
}

module.exports = {
    addPlayer,
    getPlayerById,
    getPlayerByConnection,
    removePlayer,
};
