window.Game = {
    GameManager: null,
    BlockManager: null,
    PlayerManager: null,
    ClickManager: null,
    BubbleManager: null,
    PathManager: null,
    ComboManager: null
}

window.GameState = cc.Enum({
    None: 0,
    Pause: 1,
    Play: 2,
    Over: 3
})

window.DirectState = cc.Enum({
    None: 0,
    Left: 1,
    Right: 2
})

window.GLB = {
    RANDOM_MATCH: 1,
    PROPERTY_MATCH: 2,
    COOPERATION: 1,
    COMPETITION: 2,
    MAX_PLAYER_COUNT: 2,

    PLAYER_COUNTS: [2],

    GAME_START_EVENT: "gameStart",
    GAME_OVER_EVENT: "gameOver",
    READY: "ready",
    ROUND_START: "roundStar",
    SCORE_EVENT: "score",
    DELETE_BLOCK:"deleteBlock",
    DISTANCE: "distance",
    INITMAP:"initMap",
    BUBBLE:"bubble",
    TIME_OUT:"timeOut",
    GET_GAME_DATA:"getGameData",
    RECONNECTION_DATA:"ReconnectionData",
    COUNT_DOWN:"countDown",

    channel: 'MatchVS',
    platform: 'alpha',
    gameId: 201681,
    gameVersion: 1,
    IP: "wxrank.matchvs.com",
    PORT: "3010",
    GAME_NAME: "game10",
    appKey: 'd5b8332763ac468e9462488110e10955',
    secret: '542763e151f04defa81195fbe2fca935',

    matchType: 1,
    gameType: 2,
    userInfo: null,
    playerUserIds: [],
    isRoomOwner: false,

    syncFrame: true,
    FRAME_RATE: 10,
    nickName: null,
    avatarUrl: null,

    NormalBulletSpeed: 1000,
    limitX: 53,
    limitY: 780,
    range:77
}
