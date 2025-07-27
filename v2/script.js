const version = '2.34.5+528';

function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}

function strmax(str, length) {
    return str.length > length ?
        (str.substr(0, length - 3) + '...') :
        str;
}

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const obsVersionStr = (navigator.userAgent.match(/OBS\/([^\s]+)/) || [])[1];
const obsVersion = obsVersionStr ? parseSemver(obsVersionStr) : null;

(function($) { // Thanks to BrunoLM (https://stackoverflow.com/a/3855394)
    $.QueryString = (function(paramsArray) {
        let params = {};

        for (let i = 0; i < paramsArray.length; ++i) {
            let param = paramsArray[i]
                .split('=', 2);

            if (param.length !== 2)
                continue;

            params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
        }

        return params;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

function escapeRegExp(string) { // Thanks to coolaj86 and Darren Cook (https://stackoverflow.com/a/6969486)
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(message) {
    return message
        .replace(/&/g, "&amp;")
        .replace(/(<)(?!3)/g, "&lt;")
        .replace(/(>)(?!\()/g, "&gt;");
}

function twitchAPIproxy(path, params) {
    let pathEncoded = encodeURIComponent(path);
    let paramsEncoded = params ? '&params=' + encodeURIComponent(params) : '';
    return fetch(`https://chatis.is2511.com/v2/twitch-api/?path=${pathEncoded}${paramsEncoded}`);
}

let ttsStorage = [];
let floatStorage = {};
function showFloat(id, msg, millis = 5*1000, alpha = 0.3, zIndex = 0) {
    if (floatStorage[id])
        removeFloat(id);
    const chatFontSize = window.getComputedStyle(document.getElementById("chat_container")).fontSize;
    const style = `
        position: fixed;
        left: 50%;
        bottom: 1%;
        max-width: 99%;
        white-space: pre-wrap;
        margin: 0;
        padding: 2px;
        background: rgba(0,0,0,${alpha});
        color: #fff;
        font-weight: 800;
        font-size: ${chatFontSize};
        z-index: ${zIndex};
        transform: translate(-50%, 0);
    `.replace(/\s+/g, ' ').trim();
    let $float = $(`<pre data-id="${id}" style="${style}">${msg}</pre>`);
    $('body').append($float);
    floatStorage[id] = $float;
    setTimeout(() => {
        $float.remove();
    }, millis);
    return $float;
}
function removeFloat(id) {
    if (floatStorage[id]) {
        floatStorage[id].remove();
        floatStorage[id] = null;
    }
    return id;
}

function makeFunction(code) {
    return new Function('"use strict"; ' + code);
}

const wsCloseCodesPrecursor = [
    [1000, 'OK'],
    [1005, 'NO_CODE_PROVIDED'],

    // ChatIS
    [4101, 'CHATIS_RECONNECTING'],

    // 7tv EventAPI
    [4000, 'SERVER_ERROR'], // an error occured on the server's end 	Yes
    [4001, 'UNKNOWN_OPERATION'], // the client sent an unexpected opcode 	No¹
    [4002, 'INVALID_PAYLOAD'], // the client sent a payload that couldn't be decoded 	No¹
    [4003, 'AUTH_FAILURE'], // the client unsucessfully tried to identify 	No¹
    [4004, 'ALREADY_IDENTIFIED'], // the client wanted to identify again 	No¹
    [4005, 'RATE_LIMITED'], // the client is being rate-limited 	Maybe³
    [4006, 'RESTART'], // the server is restarting and the client should reconnect 	Yes
    [4007, 'MAINTENANCE'], // the server is in maintenance mode and not accepting connections 	Yes²
    [4008, 'TIMEOUT'], // the client was idle for too long 	Yes
    [4009, 'ALREADY_SUBSCRIBED'], // the client tried to subscribe to an event twice 	No¹
    [4010, 'NOT_SUBSCRIBED'], // the client tried to unsubscribe from an event they weren't subscribing to 	No¹
    [4011, 'INSUFFICIENT_PRIVILEGE'], // the client did something that they did not have permission for 	Maybe³
    // ¹ this code indicate a bad client implementation. you must log such error and fix the issue before reconnecting
    // ² reconnect with significantly greater delay, i.e at least 5 minutes, including jitter
    // ³ only reconnect if this was initiated by action of the end-user
];

const styleSettingsMap = {
    size: ['small', 'medium', 'large'],
    font: [
        'BalooTammudu', 'SegoeUI', 'Roboto', 'Lato',
        'NotoSans', 'SourceCodePro', 'Impact', 'Comfortaa',
        'DancingScript', 'IndieFlower', 'OpenSans', 'AlsinaUltrajada'
    ],
    stroke: ['thin', 'medium', 'thick', 'thicker'],
    shadow: ['small', 'medium', 'large'],
};

function parseSemver(version) {
    // Based on https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    
    let matches = version.match(semverRegex);
    return {
        major: parseInt(matches[1]),
        minor: parseInt(matches[2]),
        patch: parseInt(matches[3]),
        preRelease: matches[4],
        build: matches[5]
    }
}

// Thanks to https://github.com/owumaro/text-stroke-generator/
function textStrokeViaShadow(thickness, color = 'black') {
    let shadowLayer = function (x, y, color, precision = 5) {
        x = parseFloat(x.toFixed(precision));
        y = parseFloat(y.toFixed(precision));
        return `${x}px ${y}px ${color}`;
    }

    let textShadow = 'text-shadow: ';
    for (let angle = 0; angle < 2 * Math.PI; angle += 1/thickness) {
        if (angle !== 0)
            textShadow += ', ';
        textShadow += shadowLayer(Math.cos(angle) * thickness, Math.sin(angle) * thickness, color);
    }
    textShadow += ';';

    return textShadow;
}

// See https://github.com/IS2511/ChatIS/issues/16#issuecomment-2745986759
function applyTextStroke($elem, thickness, color = 'black') {
    if (obsVersion && obsVersion.major >= 31) {
        $elem.css('paint-order', 'stroke fill');
        $elem.css('-webkit-text-stroke', thickness + 'px ' + color);
    } else {
        $elem.css('text-shadow', textStrokeViaShadow(thickness, color));
    }
}


var Chat = {
    info: {
        channelID: null,
        channel: null,
        animate: ('animate' in $.QueryString ? ($.QueryString.animate.toLowerCase() === 'true') : false),
        bots: ('bots' in $.QueryString ? ($.QueryString.bots.toLowerCase() === 'true') : false),
        hideSpecialBadges: ('hide_special_badges' in $.QueryString ?
            ($.QueryString.hide_special_badges.toLowerCase() === 'true') : false),
        showHomies: ('show_homies' in $.QueryString ?
            ($.QueryString.show_homies.toLowerCase() === 'true') : false),
        fade: ('fade' in $.QueryString ? parseInt($.QueryString.fade) : false),
        size: ('size' in $.QueryString ? parseInt($.QueryString.size) : 3),
        font: ('font' in $.QueryString ? parseInt($.QueryString.font) : 0),
        fontCustom: ('fontCustom' in $.QueryString ? $.QueryString.fontCustom : ""),
        stroke: ('stroke' in $.QueryString ? parseInt($.QueryString.stroke) : false),
        shadow: ('shadow' in $.QueryString ? parseInt($.QueryString.shadow) : false),
        emoteScale: ('emoteScale' in $.QueryString ? parseFloat($.QueryString.emoteScale) : 1),
        smallCaps: ('small_caps' in $.QueryString ? ($.QueryString.small_caps.toLowerCase() === 'true') : false),
        nlAfterName: ('nl_after_name' in $.QueryString ? ($.QueryString.nl_after_name.toLowerCase() === 'true') : false),
        hideNames: ('hide_names' in $.QueryString ? ($.QueryString.hide_names.toLowerCase() === 'true') : false),
        markdown: ('markdown' in $.QueryString ? ($.QueryString.markdown.toLowerCase() === 'true') : false),
        md_image: ('md_image' in $.QueryString ? ($.QueryString.md_image) : false),
        botNames: ('botNames' in $.QueryString ? $.QueryString.botNames : ""),
        lastEmoteBackground: ('last_emote_background' in $.QueryString ? ($.QueryString.last_emote_background.toLowerCase() === 'true') : false),
        reverseLineOrder: ('reverse_line_order' in $.QueryString ? ($.QueryString.reverse_line_order.toLowerCase() === 'true') : false),
        horizontal: ('horizontal' in $.QueryString ? ($.QueryString.horizontal.toLowerCase() === 'true') : false),
        singleChatter: ('single_chatter' in $.QueryString ? $.QueryString.single_chatter.toLowerCase() : ""),
        ttsReadsChat: false,
        emotes: {},
        badges: {},
        userBadges: {},
        ffzapBadges: null,
        bttvBadges: null,
        // seventvBadges: null,
        chatterinoBadges: null,
        homiesBadges: {
            1: [],
            2: [],
            3: [],
        },
        // seventvPaints: null,
        chatisBadges: {
            urlPrefix: 'https://chatis.is2511.com/v2/badges',
            modBadge: new Map([3, 2, 1].map((size) => {
                return [`${size}`, `https://chatis.is2511.com/v2/badges/chatis-mod/${size}x.png`];
            })),
            userBadges: new Map([
                ['is2511', 'webp', [3, 2, 1]],
                ['arturthefoe', 'png', [3, 2, 1]],
                ['shooksby', 'png', [3, 2, 1]],
                ['dj_ziggy', 'png', [3]],
                ['liptongod', 'webp', [3, 2, 1]],
                ['itsbandorax', 'webp', [3, 2, 1]],
                ['styles', 'webp', [3, 2, 1]],
                ['truer', 'png', [3, 2, 1]],
                ['platonicthough', 'png', [3]]
            ].map((badge) => {
                const [username, ext, sizes] = badge;
                return [username, new Map(sizes.map((size) => {
                    return [`${size}`, `https://chatis.is2511.com/v2/badges/users/${username}/${size}x.${ext}`];
                }))];
            })),
            
        },
        nocmd: {
            whitelist: new Set([
                'refresh',
                'reload',
                'stop',
            ]),
            channels: new Set([
                'avghans',
                'nicro',
                'qtcinderella',
                'amouranth',
                'elpws',
                'quacky',
                'zomballr',
                'gronkh',
                'stonepa',
                'unice2nice',
                'holdenpnw',
                'kotarrikotu',
                'youngbasedgo',
                'poggieluva',
                'kaicenat',
                'jynxzi',
                'thesketchreal',
                'feelssunnyman',
                'insomniatricz',
                'mooda',
                'pion_limon',
                'tipo_lon',
                'murgois',
            ])
        },
        cheers: {},
        lines: []
    },
    cache: {
        tts: new Map(),
        badges: {},
        globalMods: [],
        lastEmoteInMessage: null,
        lastEmoteInMessageLink: null,
        perms: {},
    },
    flags: {
        usingHackyStrokeViaShadow: false,
    },

    // Called by img elements with the zerowidth class
    zw: function (elem) {
        $(elem).css('margin-left', '-' + (elem.clientWidth) + 'px');
    },


    // 7tv EventAPI stuff
    stv: {
        // General structure: { $id: object }
        // Paint object: { id: "...", name: "...", image_url: "...", angle, color, function, repeat, shadows, shape, stops: [ at, color ] }
        // Badge object: { id: "...", name: "...", tooltip: "...", urls: [ ["1", "..."], ["2", "..."], ["3", "..."] ] }
        cosmetics: new Map(),

        // General structure: { $username: [ objectId1, objectId2 ] }
        // So it could be `userCosmetics: { "RealTwitchUser": [ "id1", "id2", "id3" ] }
        // Where IDs correspond to cosmetics[$id]
        userCosmetics: new Map(),

        channelEmoteSetId: null,

        subscribeToEventApi: async function () {
            // https://events.7tv.io
            // wss://events.7tv.io/v3
            // https://events.7tv.io/v3
            // https://events.7tv.io/v3@entitlement.*<>,cosmetic.*<>,emote_set.*<>

            // TODO: Make the loading thing await this whole function

            console.debug("[ChatIS][7tv] Connecting to EventAPI v3 using WSS...");

            const id = Chat.info.channelID;
            const seventvUser = await (await fetch(`https://7tv.io/v3/users/twitch/${id}`)).json();
            // TODO: Cache the result, avoid fetching this same endpoint again for emotes at load
            const channelEmoteSetId = ((seventvUser || {}).emote_set || {}).id;
            if (channelEmoteSetId)
                Chat.stv.channelEmoteSetId = channelEmoteSetId;

            Chat.stv.eventApi.connectWs(false);

            console.info("[ChatIS][7tv] Connected to EventAPI v3. Channel emote set id:", channelEmoteSetId, "Channel id:", id);
        },

        eventApi: {
            ws: null,
            sessionId: null,
            ackCount: 0,
            resumeAck: false,

            wsCloseCodes: Object.fromEntries(wsCloseCodesPrecursor.map((pair) => [pair[1], pair[0]])),
            wsCloseCodeNames: new Map(wsCloseCodesPrecursor),

            heartbeat: {
                timeoutId: null,
                intervalMs: null,
                
                init: (intervalMs) => {
                    Chat.stv.eventApi.heartbeat.intervalMs = intervalMs;
                    Chat.stv.eventApi.heartbeat.timeoutId = setTimeout(Chat.stv.eventApi.heartbeat.timeoutHandler, 3 * (Chat.stv.eventApi.heartbeat.intervalMs + 1000));
                },
                gotHeartbeat: () => {
                    if (Chat.stv.eventApi.heartbeat.intervalMs) {
                        clearTimeout(Chat.stv.eventApi.heartbeat.timeoutId);
                        Chat.stv.eventApi.heartbeat.timeoutId = setTimeout(Chat.stv.eventApi.heartbeat.timeoutHandler, 3 * (Chat.stv.eventApi.heartbeat.intervalMs + 1000));
                    }
                },
                stop: () => {
                    clearTimeout(Chat.stv.eventApi.heartbeat.timeoutId);
                    Chat.stv.eventApi.heartbeat.intervalMs = null;
                },
                timeoutHandler: () => {
                    Chat.stv.eventApi.reconnect.now(true);
                },
            },

            reconnect: {
                timeoutId: null,

                now: (resume, reason) => {
                    console.debug("[ChatIS][7tv] EventAPI, reconnecting... (Reason:", reason, ")");
                    Chat.stv.eventApi.reconnect.cancel();
                    Chat.stv.eventApi.connectWs(resume);
                },
                after: (resume, timeoutMs, jitterMs, reason) => {
                    const realTimeoutMs = timeoutMs + jitterMs * (1 - 2 * Math.random());
                    console.debug("[ChatIS][7tv] EventAPI, reconnecting in about", Math.round(realTimeoutMs/1000), "seconds... (Reason:", reason, ")");
                    Chat.stv.eventApi.reconnect.cancel();
                    Chat.stv.eventApi.reconnect.timeoutId = setTimeout(() => {
                        console.debug("[ChatIS][7tv] EventAPI, reconnecting as scheduled...");
                        Chat.stv.eventApi.connectWs(resume);
                    }, realTimeoutMs);
                },
                cancel: () => {
                    if (Chat.stv.eventApi.reconnect.timeoutId) {
                        clearTimeout(Chat.stv.eventApi.reconnect.timeoutId);
                        Chat.stv.eventApi.reconnect.timeoutId = null;
                    }
                }
            },

            genSubs: (twitchId, channelEmoteSetId) => {
                let subs = [];
                if (twitchId) {
                    subs = subs.concat([
                        {
                            type: "entitlement.*",
                            condition: {
                                platform: "TWITCH",
                                ctx: "channel",
                                id: twitchId,
                            },
                        },
                        {
                            type: "cosmetic.*",
                            condition: {
                                platform: "TWITCH",
                                ctx: "channel",
                                id: twitchId,
                            },
                        },
                        {
                            type: "emote_set.*",
                            condition: {
                                platform: "TWITCH",
                                ctx: "channel",
                                id: twitchId,
                            },
                        },
                    ]);
                }
                if (channelEmoteSetId) {
                    subs.push({
                        type: "emote_set.update",
                        condition: {
                            object_id: channelEmoteSetId,
                        },
                    });
                }
                return subs;
            },
            
            sendMsg: (op, d) => {
                Chat.stv.eventApi.ws.send(JSON.stringify({
                    op: op,
                    t: Date.now(),
                    d: d,
                }));
            },
            
            ackOrTimeout: (handler, timeoutMs) => {
                const oldAckCount = Chat.stv.eventApi.ackCount;
                setTimeout(() => {
                    if (oldAckCount >= Chat.stv.eventApi.ackCount) {
                        handler();
                    }
                }, timeoutMs);
            },
            
            closeWs: () => {
                Chat.stv.eventApi.heartbeat.stop();
                
                if (Chat.stv.eventApi.ws) {
                    Chat.stv.eventApi.ws.close(Chat.stv.eventApi.wsCloseCodes.CHATIS_RECONNECTING, "ChatIS reconnecting");
                    Chat.stv.eventApi.ws = null;
                }
                
                Chat.stv.eventApi.ackCount = 0;
                Chat.stv.eventApi.resumeAck = false;
            },
            
            connectWs: (resume) => {
                Chat.stv.eventApi.closeWs();
                
                const ops = {
                    DISPATCH: 0,
                    HELLO: 1,
                    HEARTBEAT: 2,
                    RECONNECT: 4,
                    ACK: 5,
                    ERROR: 6,
                    END_OF_STREAM: 7,
                    
                    IDENTIFY: 33,
                    RESUME: 34,
                    SUBSCRIBE: 35,
                    UNSUBSCRIBE: 36,
                    SIGNAL: 37
                };
                
                Chat.stv.eventApi.ws = new WebSocket("wss://events.7tv.io/v3");
                
                Chat.stv.eventApi.ws.addEventListener("open", (event) => {
                    console.debug("[ChatIS][7tv] EventAPI WS opened");
                });
                
                Chat.stv.eventApi.ws.addEventListener("message", (event) => {
                    // console.debug("[ChatIS][7tv] EventAPI WS message event:", event);

                    const data = JSON.parse(event.data);

                    // console.debug("[ChatIS][7tv] EventAPI WS message:", data);
                    
                    switch (data.op) {
                        case ops.DISPATCH: {
                            Chat.stv.handleDispatchEvent(data);
                        } break;
                        case ops.HELLO: {
                            console.debug("[ChatIS][7tv] EventAPI, got HELLO from server, sessionId:", data.d.session_id);
                            if (resume && Chat.stv.eventApi.sessionId) {
                                console.debug("[ChatIS][7tv] EventAPI, trying to RESUME using sessionId:", Chat.stv.eventApi.sessionId);
                                Chat.stv.eventApi.sendMsg(ops.RESUME, {
                                    session_id: Chat.stv.eventApi.sessionId,
                                });
                                setTimeout(() => {
                                    if (!Chat.stv.eventApi.resumeAck) {
                                        Chat.stv.eventApi.reconnect.now(false, "failed to resume");
                                    }
                                }, 5 * 1000);
                            } else {
                                Chat.stv.eventApi.sessionId = data.d.session_id;
                                for (const sub of Chat.stv.eventApi.genSubs(Chat.info.channelID, Chat.stv.channelEmoteSetId)) {
                                    Chat.stv.eventApi.sendMsg(ops.SUBSCRIBE, sub);
                                }
                            }

                            Chat.stv.eventApi.heartbeat.init(data.d.heartbeat_interval);
                        } break;
                        case ops.HEARTBEAT: {
                            Chat.stv.eventApi.heartbeat.gotHeartbeat();
                        } break;
                        case ops.RECONNECT: {
                            Chat.stv.eventApi.reconnect.now(true, "got RECONNECT");
                        } break;
                        case ops.ACK: {
                            Chat.stv.eventApi.ackCount = Chat.stv.eventApi.ackCount + 1;
                            if (data.d.command === "RESUME") {
                                Chat.stv.eventApi.resumeAck = true;
                                console.debug("[ChatIS][7tv] EventAPI, successfully RESUMEd with sessionId:", Chat.stv.eventApi.sessionId);
                            }
                        } break;
                        case ops.ERROR: {
                            Chat.stv.eventApi.reconnect.now(false, "got ERROR");
                        } break;
                        case ops.END_OF_STREAM: {
                            Chat.stv.eventApi.reconnect.now(false, "got END_OF_STREAM");
                        } break;
                    }
                });
                
                Chat.stv.eventApi.ws.addEventListener("close", (event) => {
                    console.debug("[ChatIS][7tv] EventAPI WS close:", event);

                    const codes = Chat.stv.eventApi.wsCloseCodes;

                    const codeToStr = (code) => {
                        return Chat.stv.eventApi.wsCloseCodeNames.get(code) || `${code}`;
                    };
                    
                    switch (event.code) {
                        case codes.CHATIS_RECONNECTING: {
                            // Us closing the socket during a reconnect
                            // Do nothing
                        } break;
                        case codes.SERVER_ERROR:
                        case codes.RESTART: {
                            Chat.stv.eventApi.reconnect.now(true, `closed with ${codeToStr(event.code)}`);
                        } break;
                        case codes.RATE_LIMITED:
                        case codes.MAINTENANCE: {
                            Chat.stv.eventApi.reconnect.after(false, 70 * 1000, 10 * 1000, `closed with ${codeToStr(event.code)}`);
                        } break;
                        default: {
                            if (event.code >= 4000) {
                                Chat.stv.eventApi.reconnect.now(false, `closed with 4XXX (${codeToStr(event.code)})`);
                            } else {
                                Chat.stv.eventApi.reconnect.after(false, 20 * 1000, 10 * 1000, `closed with other (${event.code})`);
                            }
                        } break;
                    }
                });
                
                Chat.stv.eventApi.ws.addEventListener("error", (event) => {
                    console.warn("[ChatIS][7tv] EventAPI WS error:", event);

                    Chat.stv.eventApi.reconnect.after(false, 20 * 1000, 10 * 1000, "WebSocket error");
                });
                
            }
            
        },

        handleDispatchEvent: function (event) {
            const data = event.d;
            console.debug("[ChatIS][7tv] EventAPI, DISPATCH full:", data);

            // // Extended logs
            // switch (data.type) {
            //     case 'emote_set.create':
            //     // case 'emote_set.update':
            //     case 'emote_set.delete':
            //         console.debug("[ChatIS][7tv] ", data.type, " short:", {
            //             id: data.body.object.id,
            //             // kind: "EMOTE_SET",
            //             name: data.body.object.name,
            //         });
            //         break;
            //     case 'cosmetic.create':
            //     // case 'cosmetic.update':
            //     case 'cosmetic.delete':
            //         console.debug("[ChatIS][7tv] ", data.type, " short:", {
            //             id: data.body.object.id,
            //             kind: data.body.object.kind,
            //             name: data.body.object.data.name,
            //         });
            //         break;
            //     case 'entitlement.create':
            //     // case 'entitlement.update':
            //     case 'entitlement.delete':
            //         console.debug("[ChatIS][7tv] ", data.type, " short:", {
            //             ref_id: data.body.object.ref_id,
            //             user: data.body.object.user.username,
            //             kind: data.body.object.kind,
            //             // name: data.body.object.data.name,
            //         });
            //         break;
            // }

            switch (data.type) {
                case 'emote_set.create': {
                    // console.debug("[ChatIS][7tv] EventAPI DISPATCH emote_set.create:", data.body);
                } break;
                case 'emote_set.update': {
                    const emotesRemoved = (data.body.pulled || []).map(obj => obj.old_value);
                    const emotesAdded = (data.body.pushed || []).map(obj => obj.value.data);
                    const emotesUpdated = (data.body.updated || []);
                    // showFloat(9, '7TV emote update!', 2*1000);
                    for (const emote of emotesUpdated) {
                        delete Chat.info.emotes[emote.old_value.name];
                        Chat.info.emotes[emote.value.name] = Chat.stv.emoteToChatisEmote(emote.value.data, false);
                        if (data.body.id === Chat.stv.channelEmoteSetId) // Updates are about the channel emote set
                            showFloat(9, '7TV emote update!\n' + 'UPDATE:\n'
                                + strmax(emote.old_value.name, 13) + ' ->\n' + strmax(emote.value.name, 16),
                                3*1000);
                    }

                    for (const emote of emotesRemoved) {
                        // console.log("[ChatIS][7tv] EventAPI emote remove:", emote.name);
                        delete Chat.info.emotes[emote.name];
                        if (data.body.id === Chat.stv.channelEmoteSetId) // Updates are about the channel emote set
                            showFloat(9, '7TV emote update!\n' + 'REMOVE:\n' + strmax(emote.name, 16), 3*1000);
                    }
                    for (const emote of emotesAdded) {
                        // console.log("[ChatIS][7tv] EventAPI emote add:", emote.name, " ", Chat.stv.emoteToChatisEmote(emote, false));
                        Chat.info.emotes[emote.name] = Chat.stv.emoteToChatisEmote(emote, false);
                        if (data.body.id === Chat.stv.channelEmoteSetId) // Updates are about the channel emote set
                            showFloat(9, '7TV emote update!\n' + 'ADD:\n' + strmax(emote.name, 16), 3*1000);
                    }

                    console.debug("[ChatIS][7tv] EventAPI emotes added:", emotesAdded, "emotes removed:", emotesRemoved);
                } break;
                case 'emote_set.delete': {
                    // console.debug("[ChatIS][7tv] EventAPI DISPATCH emote_set.delete:", data.body);
                } break;

                case 'cosmetic.create': {
                    switch (data.body.object.kind) {
                        case 'PAINT':
                        case 'BADGE': {
                            let cosmetic = data.body.object.data;
                            cosmetic._kind = data.body.object.kind;
                            Chat.stv.cosmetics.set(data.body.object.id, cosmetic);
                            console.debug("[ChatIS][7tv] EventAPI cosmetic create:", cosmetic);
                        } break;
                    }
                } break;
                case 'cosmetic.update': {
                    // I'll deal with this later ig bruh
                } break;
                case 'cosmetic.delete': {
                    switch (data.body.object.kind) {
                        case 'PAINT':
                        case 'BADGE':
                            Chat.stv.cosmetics.delete(data.body.object.id);
                            console.debug("[ChatIS][7tv] EventAPI cosmetic delete:", data.body.object.id);
                            break;
                    }
                } break;

                case 'entitlement.create': {
                    // const username = data.body.object.user.username; // 7tv username, can be different
                    const username = ((data.body.object.user.connections || [])
                        .find(conn => conn.platform === "TWITCH") || {}).username
                        || data.body.object.user.username;
                    switch (data.body.object.kind) {
                        // case 'AVATAR':
                        // case 'EMOTE_SET':
                        case 'BADGE':
                            Chat.stv.addBadgeToUserBadges(username, data.body.object.ref_id);
                            console.debug("[ChatIS][7tv] EventAPI entitlement create BADGE:", username, data.body.object.ref_id);
                            break;
                        case 'PAINT':
                            if (!Chat.stv.userCosmetics.has(username))
                                Chat.stv.userCosmetics.set(username, []);
                            Chat.stv.userCosmetics.get(username).push(data.body.object.ref_id)
                            console.debug("[ChatIS][7tv] EventAPI entitlement create PAINT:", username, data.body.object.ref_id);
                            break;
                    }
                } break;
                case 'entitlement.update': {
                    // I'll deal with this later ig bruh
                } break;
                case 'entitlement.delete': {
                    const username = ((data.body.object.user.connections || [])
                            .find(conn => conn.platform === "TWITCH") || {}).username
                        || data.body.object.user.username;
                    switch (data.body.object.kind) {
                        case 'BADGE':
                            Chat.stv.removeBadgeFromUserBadges(username, data.body.object.ref_id);
                            break;
                        case 'PAINT':
                            if (Chat.stv.userCosmetics.has(username))
                                Chat.stv.userCosmetics.set(username,
                                    Chat.stv.userCosmetics.get(username)
                                        .filter(e => e !== data.body.object.ref_id)
                                )
                            break;
                    }
                } break;

                default:
                    break;
            }
        },

        addBadgeToUserBadges: function (username, id) {
            Chat.stv.removeBadgeFromUserBadges(username, id); // Remove if already exists with that id
            const cosmetic = Chat.stv.cosmetics.get(id);
            if (!Chat.info.userBadges[username])
                Chat.info.userBadges[username] = [];
            Chat.info.userBadges[username].push({
                id: id,
                source: 'stv',
                description: cosmetic.tooltip,
                url: 'https:' + cosmetic.host.url + '/3x'
            });
        },
        removeBadgeFromUserBadges: function (username, id) {
            if (!Chat.info.userBadges[username])
                Chat.info.userBadges[username] = [];
            Chat.info.userBadges[username] = Chat.info.userBadges[username].filter(e => e.id !== id);
        },

        // getBadgesFor: function (username) {
        //     let badges = [];
        //     if (Chat.stv.userCosmetics.has(username))
        //         for (const cosmeticId of Chat.stv.userCosmetics.get(username)) {
        //             if (Chat.stv.cosmetics.get(cosmeticId)._kind === "BADGE")
        //                 return badges.push(Chat.stv.cosmetics.get(cosmeticId));
        //         }
        //     return badges;
        // },
        getNamepaintsFor: function (username) {
            let namepaints = [];
            if (Chat.stv.userCosmetics.has(username))
                for (const cosmeticId of Chat.stv.userCosmetics.get(username)) {
                    const cosmetic = Chat.stv.cosmetics.get(cosmeticId);
                    if (cosmetic._kind === "PAINT")
                        namepaints.push(cosmetic);
                }
            return namepaints;
        },

        emoteToChatisEmote: function (seventvEmote, global) {
            const webpFiles = seventvEmote.host.files
                .filter(file => file.format === 'WEBP');
            const maxSizeName = webpFiles[webpFiles.length - 1].name;
            return {
                platform: 'stv',
                id: seventvEmote.id,
                image: 'https:' + seventvEmote.host.url + '/' + (maxSizeName || '4x.webp'),
                global: global,
                zeroWidth: (seventvEmote.flags & 256) !== 0 // EmoteFlagsZeroWidth = 256
            }
        }
    },



    initFlags: function () {
        // See https://github.com/IS2511/ChatIS/issues/16#issuecomment-2745986759
        Chat.flags.usingHackyStrokeViaShadow = true;
        if ((obsVersion && obsVersion.major >= 31)) {
            Chat.flags.usingHackyStrokeViaShadow = false;
        }
    },

    reportLoading: function () {
        Chat.info.reportLoadingTrackers = {
            mainChat: new Promise(function (resolve, reject) {

            }),
            cmdChat: new Promise(function (resolve, reject) {

            }),
            stvEvents: new Promise(function (resolve, reject) {

            }),
        };
        Chat.info.reportLoadingTrackers.all = new Promise(function (resolve, reject) {
            (async () => {
                await Chat.info.reportLoadingTrackers.mainChat;
                await Chat.info.reportLoadingTrackers.cmdChat;
                await Chat.info.reportLoadingTrackers.stvEvents;

                resolve();
            })();
        });

    },

    loadCosmetics: function(channelID) {
        // https://api.7tv.app/v2/cosmetics/?user_identifier=login
        // user_identifier: "object_id", "twitch_id", "login"
        let user_identifier = 'login';

        // Chat.info.seventvPaints = [];

        let stvPromise = new Promise(function(resolve, reject) {
            (async () => {
                // Deprecated in favor of 7tv EventAPI v3, see `Chat.stv`
                // setTimeout(() => { resolve(false); }, 5000);
                // $.getJSON('https://7tv.io/v2/cosmetics?user_identifier=' + user_identifier).done(function (res) {
                //     Chat.info.seventvPaints = res.paints;
                //     resolve(true);
                // });
                resolve(true);
            })();
        });

        return new Promise(function(resolve, reject) {
            (async () => {
                await stvPromise;
                resolve(true);
            })();
        });
    },

    loadEmotes: function(channelID) {
        Chat.info.emotes = {};
        // Load BTTV, FFZ and 7TV emotes

        let ffzPromise = new Promise(function(resolve, reject) {
            (async () => {
                setTimeout(() => { resolve(false); }, 1000);
                let endpoints = ['emotes/global', 'users/twitch/' + encodeURIComponent(channelID)];
                endpoints.forEach((endpoint, index) => {
                    $.getJSON('https://api.betterttv.net/3/cached/frankerfacez/' + endpoint).done(function(res) {
                        // showFloat(100 + index, endpoint, 7*1000*index);
                        res.forEach(emote => {
                            let imageUrl = emote.images['4x'] || ( emote.images['2x'] || emote.images['1x'] );
                            let upscale = true;
                            if (emote.images['4x'])
                                upscale = false;
                            // TODO: Proper emote priority
                            // if (Chat.info.emotes[emote.code]) {
                            //     if ((endpoint !== 'emotes/global') && Chat.info.emotes[emote.code].global)
                                    Chat.info.emotes[emote.code] = {
                                        platform: 'ffz',
                                        id: emote.id,
                                        image: imageUrl,
                                        upscale: upscale,
                                        global: endpoint === 'emotes/global',
                                        zeroWidth: false
                                    };
                            // }
                        });
                        if (index === endpoints.length - 1) {
                            resolve(true);
                        }
                    });
                });
            })();
        });

        let bttvZerowidth = [
            '5e76d399d6581c3724c0f0b8', // cvMask
            '5e76d338d6581c3724c0f0b2', // cvHazmat
            '567b5b520e984428652809b6', // SoSnowy
            '5849c9a4f52be01a7ee5f79d', // IceCold
            '567b5c080e984428652809ba', // CandyCane
            '567b5dc00e984428652809bd', // ReinDeer
            '5849c9c8f52be01a7ee5f79e', // TopHat
            '58487cc6f52be01a7ee5f205' // SantaHat
        ];
        let bttvPromise = new Promise(function(resolve, reject) {
            (async () => {
                await ffzPromise;
                setTimeout(() => { resolve(false); }, 1000);
                let endpoints = ['emotes/global', 'users/twitch/' + encodeURIComponent(channelID)];
                endpoints.forEach((endpoint, index) => {
                    $.getJSON('https://api.betterttv.net/3/cached/' + endpoint).done(function (res) {
                        if (!Array.isArray(res)) { // TODO: What is this? Weird, maybe old code?
                            res = res.channelEmotes.concat(res.sharedEmotes);
                        }
                        res.forEach(emote => {
                            Chat.info.emotes[emote.code] = {
                                platform: 'bttv',
                                id: emote.id,
                                image: 'https://cdn.betterttv.net/emote/' + emote.id + '/3x',
                                global: endpoint === 'emotes/global',
                                zeroWidth: bttvZerowidth.includes(emote.id)
                            };
                        });
                        if (index === endpoints.length - 1) {
                            resolve(true);
                        }
                    });
                });
            })();
        });

        let stvPromise = new Promise(function(resolve, reject) {
            (async () => {
                await ffzPromise;
                await bttvPromise;

                setTimeout(() => { resolve(false); }, 3000);

                let endpoints = ['emote-sets/global', 'users/twitch/' + encodeURIComponent(channelID)];
                // Chat.info.emotes[emote.name] = Chat.stv.emoteToChatisEmote(emote, false);
                endpoints.forEach((endpoint, index) => {
                    $.getJSON('https://7tv.io/v3/' + endpoint).done(function (res) {
                        const emotes = (res.emotes || (res.emote_set || {}).emotes) || [];
                        emotes.forEach(emoteWithMeta => {
                            const emote = emoteWithMeta.data;
                            Chat.info.emotes[emoteWithMeta.name] = Chat.stv.emoteToChatisEmote(emote,
                                endpoint === 'emote-sets/global');
                        });
                        if (index === endpoints.length - 1) {
                            resolve(true);
                        }
                    });
                });

            })();
        });

        return new Promise(function(resolve, reject) {
            (async () => {
                await ffzPromise;
                await bttvPromise;
                await stvPromise;
                resolve(true);
            })();
        });
    },

    load: function(callback) {

        Chat.initFlags();

        fetch('https://chatis.is2511.com/v2/control/mods/mod-list.json').then(function (r) {
            r.json().then(function (data) {
                if (data instanceof Array)
                    Chat.cache.globalMods = data;
            });
        });

        twitchAPIproxy("/helix/users", "login=" + Chat.info.channel).then(async function(r) {
            // TODO: Handle JSON fail, for now throwing seems fine
            let res = await r.json();

            if (!res.data[0]) {
                Chat.info.channelID = 0;
                console.error("[ChatIS][Twitch] This twitch channel does not exist!");
                showFloat(1, 'This twitch channel does not exist', 5*60*1000);
                $('#loader').hide();
            } else
                Chat.info.channelID = res.data[0].id;

            Chat.loadEmotes(Chat.info.channelID);
            Chat.loadCosmetics(Chat.info.channelID);
            Chat.stv.subscribeToEventApi();

            // size
            if ((Chat.info.size >= 1) && (Chat.info.size <= 3))
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: `styles/size_${styleSettingsMap.size[Chat.info.size - 1]}.css`
                }).appendTo("head");

            // font
            if ((Chat.info.font >= 1) && (Chat.info.font <= 12))
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: `styles/font_${styleSettingsMap.font[Chat.info.font - 1]}.css`
                }).appendTo("head");
            else
                if (Chat.info.fontCustom !== "")
                    $("#chat_container").attr('style', `font-family: "${Chat.info.fontCustom}";`)
                else
                    $("<link/>", {
                        rel: "stylesheet",
                        type: "text/css",
                        href: `styles/font_${styleSettingsMap.font[11]}.css`
                    }).appendTo("head");

            // stroke
            if (Chat.info.stroke)
                if ((Chat.info.stroke >= 1) && (Chat.info.stroke <= 4)) {
                    let thickness = 1;
                    switch (styleSettingsMap.stroke[Chat.info.stroke - 1]) {
                        case 'thin': {
                            thickness = 1;
                        } break;
                        case 'medium': {
                            thickness = 2;
                        } break;
                        case 'thick': {
                            thickness = 3;
                        } break;
                        case 'thicker': {
                            thickness = 4;
                        } break;
                    }

                    let style = `paint-order: stroke fill; -webkit-text-stroke: ${thickness}px black;`;
                    if (Chat.flags.usingHackyStrokeViaShadow) {
                        style = textStrokeViaShadow(thickness);
                    }

                    $("<style>#chat_container { " + style + " }</style>").appendTo("head");
                }

            // shadow
            if (Chat.info.shadow)
                if ((Chat.info.shadow >= 1) && (Chat.info.shadow <= 3))
                    $("<link/>", {
                        rel: "stylesheet",
                        type: "text/css",
                        href: `styles/shadow_${styleSettingsMap.shadow[Chat.info.shadow - 1]}.css`
                    }).appendTo("head");

            // emoteScale
            if (Chat.info.emoteScale !== 1) {
                let emoteHeight;
                switch (Chat.info.size) {
                    case 1:
                        emoteHeight = 25;
                        break;
                    case 2:
                        emoteHeight = 42;
                        break;
                    case 3:
                        emoteHeight = 60;
                        break;
                }
                let style = $(`<style>#chat_container .emote { max-height: ${emoteHeight * Chat.info.emoteScale}px; }</style>`);
                $('html > head').append(style);
            }



            if (Chat.info.smallCaps) {
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: "styles/variant_SmallCaps.css"
                }).appendTo("head");
            }

            if (Chat.info.nlAfterName) {
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: "styles/variant_NLAfterName.css"
                }).appendTo("head");
            }

            if (Chat.info.hideNames) {
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: "styles/variant_hideNames.css"
                }).appendTo("head");
            }

            if (Chat.info.reverseLineOrder) {
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: "styles/variant_ReverseLineOrder.css"
                }).appendTo("head");
            }

            if (Chat.info.horizontal) {
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: "styles/variant_horizontal.css"
                }).appendTo("head");
            }

            // Load badges
            twitchAPIproxy('/helix/chat/badges/global').then(async function(r) {
                let global = await r.json();

                if (!Array.isArray(global.data))
                    return;
                for (const badgeSet of global.data) {
                    const badgeName = badgeSet.set_id;
                    if (!Array.isArray(badgeSet.versions))
                        continue;
                    for (const badgeVersion of badgeSet.versions) {
                        Chat.info.badges[badgeName + ':' + badgeVersion.id] = badgeVersion.image_url_4x;
                    }
                }
                // Object.entries(global.badge_sets).forEach(badge => {
                //     Object.entries(badge[1].versions).forEach(v => {
                //         Chat.info.badges[badge[0] + ':' + v[0]] = v[1].image_url_4x;
                //     });
                // });
                twitchAPIproxy('/helix/chat/badges', 'broadcaster_id=' + encodeURIComponent(Chat.info.channelID)).then(async function(r) {
                    let channel = await r.json();

                    if (!Array.isArray(channel.data))
                        return;
                    for (const badgeSet of channel.data) {
                        const badgeName = badgeSet.set_id;
                        if (!Array.isArray(badgeSet.versions))
                            continue;
                        for (const badgeVersion of badgeSet.versions) {
                            Chat.info.badges[badgeName + ':' + badgeVersion.id] = badgeVersion.image_url_4x;
                        }
                    }
                    // Object.entries(channel.badge_sets).forEach(badge => {
                    //     Object.entries(badge[1].versions).forEach(v => {
                    //         Chat.info.badges[badge[0] + ':' + v[0]] = v[1].image_url_4x;
                    //     });
                    // });
                    $.getJSON('https://api.frankerfacez.com/v1/_room/id/' + encodeURIComponent(Chat.info.channelID)).done(function(res) {
                        if (res.room.moderator_badge) {
                            Chat.info.badges['moderator:1'] = 'https://cdn.frankerfacez.com/room-badge/mod/' + Chat.info.channel + '/4/rounded';
                        }
                        if (res.room.vip_badge) {
                            Chat.info.badges['vip:1'] = 'https://cdn.frankerfacez.com/room-badge/vip/' + Chat.info.channel + '/4';
                        }
                    });
                });
            });

            if (!Chat.info.hideSpecialBadges) {
                // $.getJSON('https://api.betterttv.net/3/cached/badges').done(function(res) {
                //     Chat.info.bttvBadges = res;
                // });
                // $.getJSON('https://api.7tv.app/v2/badges?user_identifier=login').done(function(res) {
                //     Chat.info.seventvBadges = res.badges;
                // });

                $.getJSON('https://api.ffzap.com/v1/supporters')
                    .done(function(res) {
                        Chat.info.ffzapBadges = res;
                    })
                    .fail(function() {
                        Chat.info.ffzapBadges = [];
                    });
                $.getJSON('https://api.betterttv.net/3/cached/badges')
                    .done(function(res) {
                        Chat.info.bttvBadges = res;
                    })
                    .fail(function() {
                        Chat.info.bttvBadges = [];
                    });

                $.getJSON('https://api.chatterino.com/badges')
                    .done(function(res) {
                        Chat.info.chatterinoBadges = res.badges;
                    })
                    .fail(function() {
                        Chat.info.chatterinoBadges = [];
                    });

                $.getJSON('https://itzalex.github.io/badges')
                    .done(function(res) {
                        Chat.info.homiesBadges[1] = res.badges;
                    })
                    .fail(function() {
                        Chat.info.homiesBadges[1] = [];
                    });
                $.getJSON('https://itzalex.github.io/badges2')
                    .done(function(res) {
                        Chat.info.homiesBadges[2] = res.badges;
                    })
                    .fail(function() {
                        Chat.info.homiesBadges[2] = [];
                    });
                $.getJSON('https://chatterinohomies.com/api/badges/list')
                    .done(function(res) {
                        Chat.info.homiesBadges[3] = res.badges;
                    })
                    .fail(function() {
                        Chat.info.homiesBadges[3] = [];
                    });
            }

            // Load cheers images
            twitchAPIproxy("/helix/bits/cheermotes", "broadcaster_id=" + Chat.info.channelID).then(async function(r) {
                let res = await r.json();

                res.data.forEach(action => {
                    Chat.info.cheers[action.prefix] = {}
                    action.tiers.forEach(tier => {
                        Chat.info.cheers[action.prefix][tier.min_bits] = {
                            image: tier.images.dark.animated['4'],
                            color: tier.color
                        };
                    });
                });
            });

            callback(true);
        });
    },

    update: setInterval(function() {
        if (Chat.info.lines.length > 0) {
            var lines = Chat.info.lines.join('');

            if (Chat.info.animate) {
                let $auxDiv = $('<div></div>', { class: "hidden" }).appendTo("#chat_container");
                $auxDiv.append(lines);
                let auxSize = Chat.info.horizontal ? $auxDiv.width() : $auxDiv.height();
                $auxDiv.remove();

                let $animDiv = $('<div></div>');
                if (Chat.info.horizontal) {
                    $('#chat_container').prepend($animDiv);
                } else {
                    $('#chat_container').append($animDiv);
                }
                $animDiv.animate(Chat.info.horizontal ? { "width": auxSize } : { "height": auxSize }, 150, function() {
                    $(this).remove();
                    if (Chat.info.horizontal) {
                        $('#chat_container').prepend(lines);
                    } else {
                        $('#chat_container').append(lines);
                    }
                });
            } else {
                if (Chat.info.horizontal) {
                    $('#chat_container').prepend(lines);
                } else {
                    $('#chat_container').append(lines);
                }
            }
            Chat.info.lines = [];
            var linesToDelete = $('.chat_line').length - 100;
            while (linesToDelete > 0) {
                $('.chat_line').eq(0).remove();
                linesToDelete--;
            }
        } else if (Chat.info.fade) {
            var messageTime = $('.chat_line').eq(0).data('time');
            if ((Date.now() - messageTime) / 1000 >= Chat.info.fade) {
                $('.chat_line').eq(0).fadeOut(function() {
                    $(this).remove();
                });
            }
        }
    }, 200),

    loadUserBadges: function(nick, userId) {
        console.debug("[ChatIS][badge] Loading badges for", nick, "userId:", userId, "current badges:", Chat.info.userBadges[nick]);
        if (!Chat.info.userBadges[nick])
            Chat.info.userBadges[nick] = [];
        $.getJSON('https://api.frankerfacez.com/v1/user/' + nick).always(function(res) {
            if (res.badges) {
                Object.entries(res.badges).forEach(badge => {
                    var userBadge = {
                        source: 'ffz',
                        description: badge[1].title,
                        url: badge[1].urls['4'],
                        color: badge[1].color
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                });
            }
            Chat.info.ffzapBadges.forEach(user => {
                if (user.id.toString() === userId) {
                    let color = '#755000';
                    if (user.tier == 2)
                        color = (user.badge_color || color);
                    else if (user.tier == 3) {
                        if (user.badge_is_colored == 0)
                            color = (user.badge_color || color);
                        else
                            color = false;
                    }
                    var userBadge = {
                        source: 'ffzap',
                        description: 'FFZ:AP Badge',
                        url: 'https://api.ffzap.com/v1/user/badge/' + userId + '/3',
                        color: color
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });
            Chat.info.bttvBadges.forEach(user => {
                if (user.name === nick) {
                    var userBadge = {
                        source: 'bttv',
                        description: user.badge.description,
                        url: user.badge.svg
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });
            console.debug("[ChatIS][badge] Applying Chatterino badges", Chat.info.chatterinoBadges);
            // console.debug("[ChatIS][badge] Applying Chatterino badges to", nick, "userId:", userId);
            Chat.info.chatterinoBadges.forEach(badge => {
                console.debug("[ChatIS][badge] Checking Chatterino badge kind", badge.tooltip);
                badge.users.forEach(user => {
                    console.debug("[ChatIS][badge] Chatterino badge", badge);
                    if (user === userId) {
                        var userBadge = {
                            source: 'chatterino',
                            description: badge.tooltip,
                            url: badge.image3 || badge.image2 || badge.image1
                        };
                        console.debug("[ChatIS] Possibly applying Chatterino badge to", nick, "badge:", userBadge);
                        if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                    }
                });
            });

            Chat.info.homiesBadges[1].forEach(badge => {
                badge.users.forEach(user => {
                    if (user === userId) {
                        var userBadge = {
                            source: 'homies',
                            description: badge.tooltip,
                            url: badge.image3
                        };
                        if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                    }
                });
            });
            Chat.info.homiesBadges[2].forEach(badge => {
                badge.users.forEach(user => {
                    if (user === userId) {
                        var userBadge = {
                            source: 'homies',
                            description: badge.tooltip,
                            url: badge.image3
                        };
                        if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                    }
                });
            });
            Chat.info.homiesBadges[3].forEach(badge => {
                if (badge.userId == userId) {
                    var userBadge = {
                        source: 'homies',
                        description: badge.tooltip,
                        url: badge.image3
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });

        });
    },

    calcPaintsCSS: function(nick) {
        // 7TV username paints

        let userPaint = false;
        let userPaintCSS = false;
        const paints = Chat.stv.getNamepaintsFor(nick);
        if (paints[0])
            userPaint = paints[0]

        if (userPaint) {
            let paint = userPaint;

            // let getCSSColorFromInt = (num) => ('#' + num.toString(16).padStart(6, '0'));
            let getCSSColorFromInt = (num) => {
                const red = num >>> 24 & 255;
                const green = num >>> 16 & 255;
                const blue = num >>> 8 & 255;
                const alpha = num & 255;
                return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`
            }

            let bgFunc;
            let bgFuncArgs = [];
            let isGradient = true;
            switch (paint.function) {
                case 'LINEAR_GRADIENT': // New from EventAPI v3 (capitalised now ig)
                case 'linear-gradient':
                    bgFunc = `${paint.repeat ? 'repeating-' : ''}linear-gradient`;
                    bgFuncArgs.push(`${paint.angle}deg`);
                    break;
                case 'RADIAL_GRADIENT':
                case 'radial-gradient':
                    bgFunc = `${paint.repeat ? 'repeating-' : ''}radial-gradient`;
                    bgFuncArgs.push(paint.shape || 'circle');
                    break;
                case 'URL':
                case 'url':
                    bgFunc = 'url';
                    bgFuncArgs.push(paint.image_url || '""');
                    isGradient = false;
                    break;
                default:
                    return null;
            }

            if (isGradient && paint.stops instanceof Array) {
                for (let stop of paint.stops) {
                    bgFuncArgs.push(`${getCSSColorFromInt(stop.color)} ${stop.at * 100}%`);
                }
            }

            let background = `${bgFunc}(${bgFuncArgs.join(', ')})`;

            let defaultColor;
            if (paint.color) {
                defaultColor = getCSSColorFromInt(paint.color);
            }

            let dropShadow = '';
            if (paint.shadows) { // New from EventAPI v3 (removed paint.drop_shadow, paint.shadows is now an array)
                for (const shadow of paint.shadows) {
                    dropShadow += `drop-shadow(${shadow.x_offset}px ${shadow.y_offset}px ${shadow.radius}px ${getCSSColorFromInt(shadow.color)}) `
                }
            } else if (paint.drop_shadow) {
                let shadow = paint.drop_shadow;
                dropShadow = `drop-shadow(${shadow.x_offset}px ${shadow.y_offset}px ${shadow.radius}px ${getCSSColorFromInt(shadow.color)})`;
            }

            userPaintCSS = {
                'background-image': background,
                'background-size': 'cover',
                'background-clip': 'text',
                '-webkit-background-clip': 'text',
                '-webkit-text-fill-color': 'transparent',
                'background-color': 'currentColor',
                '-webkit-text-stroke': '0px', // Stroke breaks 7tv namepaints
                // 'text-shadow': 'none', // Removing global shadow (ChatIS setting)
            }

            if (dropShadow && (dropShadow !== ''))
                userPaintCSS['filter'] = `${dropShadow};`;
            if (defaultColor)
                userPaintCSS['color'] = `${defaultColor} !important;`;

            if (Chat.flags.usingHackyStrokeViaShadow) {
                userPaintCSS['text-shadow'] = 'none';
            }
        }
        return userPaintCSS;
    },

    write: function(nick, info, message) {
        // Chat.cache.badges[nick.toLowerCase()] = info.badges;

        // TODO: Make this a Map?
        let roles = {
            mod: false,
            vip: false,
            sub: false,
            broadcaster: false,
            twitch_staff: false,
            twitch_admin: false,
            twitch_verified: false,
            // twitch_artist: false,
            // twitch_turbo: false,
            // twitch_prime: false,
            bot: false,
            chatis_mod: false,
            chatis_owner: false,
        };
        let badge_to_role = {
            "moderator": "mod",
            "vip": "vip",
            "subscriber": "sub",
            "broadcaster": "broadcaster",
            "staff": "twitch_staff",
            "admin": "twitch_admin",
            "verified": "twitch_verified",
            "bot": "bot",
        };

        if (Chat.cache.globalMods.includes(nick.toLowerCase())) {
            roles.chatis_mod = true;
        }
        if (nick.toLowerCase() === 'is2511') {
            roles.chatis_owner = true;
        }

        if (info) {
            if (typeof(info.badges) === 'string') {
                info.badges.split(',').forEach(badge => {
                    let [badge_name, badge_version] = badge.split('/');
                    if (badge_to_role[badge_name]) {
                        roles[badge_to_role[badge_name]] = true;
                    }
                });
            }
        }


        if (info) {
            var $chatLine = $('<div></div>');
            $chatLine.addClass('chat_line');
            $chatLine.attr('data-nick', nick);
            $chatLine.attr('data-time', Date.now());
            $chatLine.attr('data-id', info.id);
            var $userInfo = $('<span></span>');
            $userInfo.addClass('user_info');

            // Add data-* attributes based on roles
            let present_roles = [];
            for (let role in roles) {
                // eslint-disable-next-line no-prototype-builtins
                if (roles.hasOwnProperty(role)) {
                    if (roles[role]) {
                        present_roles.push(role);
                        $userInfo.attr(`data-role-${role}`, "");
                    }
                }
            }
            $userInfo.attr(`data-roles`, present_roles.join(','));

            // Writing badges
            if (Chat.info.hideSpecialBadges) {
                if (typeof(info.badges) === 'string') {
                    info.badges.split(',').forEach(badge => {
                        var $badge = $('<img/>');
                        $badge.addClass('badge');
                        badge = badge.split('/');
                        $badge.attr('src', Chat.info.badges[badge[0] + ':' + badge[1]]);
                        $userInfo.append($badge);
                    });
                }
            } else {
                // Adding :tf: badge
                if (nick.toLowerCase() === 'is2511') {
                    let $badge = $('<img/>');
                    $badge.addClass('badge');
                    // if (badge.color) $badge.css('background-color', badge.color);
                    $badge.attr('src', Chat.info.chatisBadges.userBadges.get('is2511').get('3'));
                    $userInfo.append($badge);
                }

                // eslint-disable-next-line no-prototype-builtins
                if ((Chat.cache.globalMods.includes(nick.toLowerCase()) || Chat.info.chatisBadges.userBadges.has(nick.toLowerCase())) && nick.toLowerCase() !== 'is2511') {
                    let $badge = $('<img/>');
                    $badge.addClass('badge');
                    // if (badge.color) $badge.css('background-color', badge.color);
                    $badge.attr('src', Chat.info.chatisBadges.modBadge.get('3'));
                    // eslint-disable-next-line no-prototype-builtins
                    if (Chat.info.chatisBadges.userBadges.has(nick.toLowerCase()) && nick.toLowerCase() !== 'is2511') {
                        $badge.attr('src', Chat.info.chatisBadges.userBadges.get(nick.toLowerCase()).get('3'));
                    }
                    $userInfo.append($badge);
                }

                var badges = [];
                const priorityBadges = ['predictions', 'admin', 'global_mod', 'staff', 'twitchbot', 'broadcaster', 'moderator', 'vip'];
                if (typeof(info.badges) === 'string') {
                    info.badges.split(',').forEach(badge => {
                        badge = badge.split('/');
                        var priority = (priorityBadges.includes(badge[0]));
                        badges.push({
                            description: badge[0],
                            url: Chat.info.badges[badge[0] + ':' + badge[1]],
                            priority: priority
                        });
                    });
                }
                var $modBadge;
                badges.forEach(badge => {
                    if (badge.priority) {
                        var $badge = $('<img/>');
                        $badge.addClass('badge');
                        $badge.attr('src', badge.url);
                        if (badge.description === 'moderator') $modBadge = $badge;
                        $userInfo.append($badge);
                    }
                });
                if (Chat.info.userBadges[nick]) {
                    Chat.info.userBadges[nick].forEach(badge => {
                        if ((badge.source === 'homies') && !Chat.info.showHomies)
                            return;
                        var $badge = $('<img/>');
                        $badge.addClass('badge');
                        if (badge.color) $badge.css('background-color', badge.color);
                        if (badge.description === 'Bot' && info.mod === '1') {
                            $badge.css('background-color', 'rgb(0, 173, 3)');
                            $modBadge.remove();
                        }
                        $badge.attr('src', badge.url);
                        $userInfo.append($badge);
                    });
                }
                badges.forEach(badge => {
                    if (!badge.priority) {
                        var $badge = $('<img/>');
                        $badge.addClass('badge');
                        $badge.attr('src', badge.url);
                        $userInfo.append($badge);
                    }
                });
            }

            // Writing username
            var $username = $('<span></span>');
            $username.addClass('nick');
            let color = '';
            if (typeof(info.color) === 'string') {
                if (tinycolor(info.color).getBrightness() <= 50) color = tinycolor(info.color).lighten(30);
                else color = info.color;
            } else {
                const twitchColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
                color = twitchColors[nick.charCodeAt(0) % 15];
            }
            if (nick.toLowerCase() === '[chatis]') color = '#FFFFFF';
            $username.css('color', color);
            $username.html(info['display-name'] ? info['display-name'] : nick);
            // if (Chat.info.seventvPaints) {
            {
                let paintCSS = Chat.calcPaintsCSS(nick);
                if (paintCSS)
                    for (let [key, value] of entries(paintCSS))
                        $username.attr('style', $username.attr('style') + `${key}: ${value};`)
            }
            $userInfo.append($username);

            // Writing message
            var $message = $('<span></span>');
            $message.addClass('message');
            let chatColors = { // sat 15 out of 100
                'is2511': '#E0D9FF',
                'iinnkii': '#EAC7DE',
                'koalas28': '#E2CFF4',
                'arturthefoe': '#FFBBEE',
                'bushwookie000': '#CCF0F0',
                'penners827': '#B5D5BD',
                'shooksby': '#998F82', // History (new->old): #F0CCE6, #FF7D95, #E6D9FF
                'dj_ziggy': '#9DAEB9',
                'byzaantine': '#D2EFF7',
                'weewoocitizen': '#FFF0D9',
                'unitooth': '#98A5B3',
                'mmattbtw': '#FAD9FF',
                'notwolfgod': '#90A9A4',
                'retrorelaxo': '#FFFDD9', // Traded for CSGO skins on Steam lol
                'neomothdev': '#CBA4FC', // sat 35 becuase begged on their knees (very real)
            }
            for (const usr in chatColors) {
                if (nick.toLowerCase() === usr) $message.css('color', chatColors[usr]);
            }
            if (/^\x01ACTION.*\x01$/.test(message)) {
                $message.css('color', color);
                message = message.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
                $userInfo.append('<span>&nbsp;</span>');
            } else {
                $userInfo.append('<span class="colon">:</span>');
            }
            $chatLine.append($userInfo);

            // Replacing emotes and cheers
            var replacements = {};
            if (typeof(info.emotes) === 'string') {
                info.emotes.split('/').forEach(emoteData => {
                    var twitchEmote = emoteData.split(':');
                    var indexes = twitchEmote[1].split(',')[0].split('-');
                    var emojis = new RegExp('[\u1000-\uFFFF]+', 'g');
                    var aux = message.replace(emojis, ' ');
                    var emoteCode = aux.substr(indexes[0], indexes[1] - indexes[0] + 1);
                    replacements[emoteCode] = '<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v2/' + twitchEmote[0] + '/default/dark/3.0" />';
                });
            }

            Object.entries(Chat.info.emotes).forEach(emote => {
                if (message.search(escapeRegExp(emote[0])) > -1) {
                    replacements[emote[0]] =
                        '<span class="emote-container">' +
                        '<img class="emote'
                        + (emote[1].upscale ? ' upscale' : '')
                        + (emote[1].zeroWidth ? ' zerowidth' : '') + '"'
                        + (emote[1].zeroWidth ? ' onload="Chat.zw(this)"' : '')
                        + ' src="' + emote[1].image + '" />' +
                        '</span>';
                }
            });

            message = escapeHtml(message);
            message = DOMPurify.sanitize(message);
            if (Chat.info.markdown) { // TODO: fix
                // const renderer = {
                //     image(href, title, text) {
                //         const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
                //         return `${escapedText}`;
                //     }
                // };
                // marked.use({ renderer });
                // message = marked(message);
                // if (message.startsWith('<p>')) {
                //     message = message.substr(3);
                //     message = message.substr(0, (message.length-1) - 4);
                // }
            }

            if (info.bits && parseInt(info.bits) > 0) {
                var bits = parseInt(info.bits);
                var parsed = false;
                for (let cheerType of Object.entries(Chat.info.cheers)) {
                    var regex = new RegExp(cheerType[0] + "\\d+\\s*", 'ig');
                    if (message.search(regex) > -1) {
                        message = message.replace(regex, '');

                        if (!parsed) {
                            var closest = 1;
                            for (let cheerTier of Object.keys(cheerType[1]).map(Number).sort((a, b) => a - b)) {
                                if (bits >= cheerTier) closest = cheerTier;
                                else break;
                            }
                            message = '<img class="cheer_emote" src="' + cheerType[1][closest].image + '" /><span class="cheer_bits" style="color: ' + cheerType[1][closest].color + ';">' + bits + '</span> ' + message;
                            parsed = true;
                        }
                    }
                }
            }

            var replacementKeys = Object.keys(replacements);
            replacementKeys.sort(function(a, b) {
                return b.length - a.length;
            });

            replacementKeys.forEach(replacementKey => {
                var regex = new RegExp("(?<!\\S)(" + escapeRegExp(replacementKey) + ")(?!\\S)", 'g');
                let lenBefore = message.length;
                message = message.replace(regex, replacements[replacementKey]);
                if (message.length !== lenBefore)
                    Chat.cache.lastEmoteInMessage = replacementKey;
            });

            Chat.cache.lastEmoteInMessageLink = ((replacements[Chat.cache.lastEmoteInMessage] || '').match(/ src="([^"]+)"/) || [])[1];
            // console.log(Chat.cache.lastEmoteInMessage, Chat.cache.lastEmoteInMessageLink);

            // let now = new Date();
            // April 1st
            const bgImage = $('#bg-image');
            // if (Chat.info.lastEmoteBackground) {
            //     bgImage.css('opacity', '');
            // } else {
            //     bgImage.css('opacity', '0.5');
            // }
            // if ((now.getDate() === 1 && now.getMonth() === 3)) {
            //     if (Chat.info.channel.toLowerCase() !== 'weest') {
            //         bgImage.attr('src', Chat.cache.lastEmoteInMessageLink);
            //         // console.log('April fools! :)');
            //     }
            // } else {
            //     if (bgImage.attr('src') !== '')
            //         bgImage.attr('src', '');
            // }

            if (Chat.info.lastEmoteBackground) {
                bgImage.attr('src', Chat.cache.lastEmoteInMessageLink);
            }

            message = twemoji.parse(message);
            $message.html(message);
            $chatLine.append($message);
            Chat.info.lines.push($chatLine.wrap('<div>').parent().html());
        }
    },

    clearChat: function(nick) {
        let f = function () {
            $('.chat_line[data-nick=' + nick + ']').remove();
        }
        f();
        // Some bots delete messages too fast, even before they appear in the DOM tree. Hence:
        setTimeout(f, 200);
        setTimeout(f, 1000);
    },

    clearMessage: function(id) {
        let f = function () {
            $('.chat_line[data-id=' + id + ']').remove();
        }
        f();
        // Some bots delete messages too fast, even before they appear in the DOM tree. Hence:
        setTimeout(f, 200);
        setTimeout(f, 1000);
    },

    parseCommand: function(message, defaultToCurrentChannel = true) {

        /*
⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⠟⢉⣴⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣶⣶⣶⣤⣭⣉⠛⣿⣿
⡿⠛⣉⣰⣿⣿⣿⣿⣟⣋⣉⣉⣹⠿⠟⣿⣿⣿⠿⠛⣛⣛⣛⣿⣿⣿⣧⣉⠛
⠄⣾⡏⣾⣛⢩⣗⣲⠿⠿⣾⣿⣿⡟⣻⠿⣿⣿⣷⡝⢻⣿⣯⣭⠖⢶⣿⣿⠃
⣦⣄⡙⢿⣿⣷⣄⡯⠅⣙⣛⡒⠂⠽⠯⠭⠉⠿⠗⠺⠿⠍⠹⠄⠂⢸⣿⠁⣾
⣿⣿⣿⣤⣙⠻⠿⣿⣷⣯⣽⣋⣸⣿⣷⠆⢶⣶⠆⢤⠆⠤⠄⣄⣀⣼⣿⠄⣿
⣿⣿⣿⣿⣿⣿⣶⣤⣬⣉⣙⡛⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣦⣤⣬⣭⣍⣉⣉⣉⣉⣉⣭⣴⣾⣿
⡟⠋⢻⣉⢉⣹⠉⣉⡏⡙⢻⣿⡟⢹⣿⣿⣿⠉⡙⢿⢹⡏⣿⠋⢻⡏⢹⢹⣿
⣧⡈⢻⣿⢸⣿⠄⣽⡇⣁⣼⣿⡇⢸⣧⣼⣿⠄⣁⣼⠸⡇⣿⣄⠙⡇⢨⢸⣿
⣧⣤⣼⣿⣼⣿⣤⣭⣧⣿⣿⣿⣥⣬⣧⣼⣿⣤⣿⣿⣤⣤⣷⣤⣴⣧⣼⣼⣿
⣏⡉⢉⣿⠟⠙⢻⣿⣿⠉⡿⠉⣿⠏⢹⣿⠛⠙⣿⣉⢉⣹⡏⢉⣹⠋⡙⢻⣿
⣿⡇⢸⣿⠄⣿⢈⣿⣿⠄⠄⠄⡿⠄⠈⣿⣄⡉⢿⣿⢸⣿⡇⢨⣽⠄⠁⢸⣿
⣿⣧⣼⣿⣦⣤⣼⣿⣿⣤⣤⣤⣧⣼⣦⣽⣤⣤⣾⣿⣼⣿⣧⣬⣽⣤⣧⣼⣿
        */

        let nick = message.prefix.split('@')[0].split('!')[0];
        let text = message.params[1];

        let channelParamMatch = text.match(/ -c ([\S\d_]+)/);
        if (channelParamMatch)
            text = text.substr(0, channelParamMatch.index)
                + text.substr(channelParamMatch.index + channelParamMatch[0].length);
        let channelParam = ( (channelParamMatch || [])[1]
            || (defaultToCurrentChannel ? Chat.info.channel : '') ).split(',');
        let isForThisChannel = () => {
            channelParam.forEach((ch, i) => {
                channelParam[i] = ch.toLowerCase();
            });
            if (channelParam.includes('all') && nick.toLowerCase() === 'is2511')
                return true;
            return channelParam.includes(Chat.info.channel.toLowerCase());
        }
        const msgSourceChannel = (message.params[0] || '').toLowerCase();

        if (text.toLowerCase().startsWith("!chatis reload") && isForThisChannel() && (nick.toLowerCase() === 'is2511')) {
            window.location.reload(true);
        }


        let isThisOverlayVisible = () => {
            if (window.obsstudio) {
                if (Chat.obs.thisVisible === 'nothing yet')
                    return true;
                return Chat.obs.thisVisible;
            } else return true;
        };

        if ((message.params[0] || '').toLowerCase() === '#is2511') { // Mods in #is2511 are global mods
            if (typeof (message.tags.badges) === 'string') {
                message.tags.badges.split(',').forEach(badge => {
                    badge = badge.split('/');
                    if (badge[0] === 'moderator') {
                        if (!Chat.cache.globalMods.includes(nick.toLowerCase()))
                            Chat.cache.globalMods.push(nick.toLowerCase());
                    }
                });
            }
            // console.log('YEP cmd from #is2511, access = ', accessLevel);
        }

        if ( text.startsWith("OMEGALUL .") && (nick.toLowerCase() === 'is2511') ) {
            // Discord pings occasionally 1h
            if (!isForThisChannel()) return;
            if (floatStorage[3]) {
                removeFloat(3);
            } else {
                let $float = showFloat(3,
                    '<iframe ' +
                    'allowFullScreen="allowFullScreen" ' +
                    'src="https://www.youtube.com/embed/sNzT5iTG4i4' +
                    '?ecver=1&iv_load_policy=1&rel=1&autohide=2&color=red&autoplay=1" ' +
                    'width="' + (vw * 0.98) + '" height="' + (vh * 0.98) + '" ' +
                    'allowtransparency="true" ' +
                    'frameborder="0">' +
                    '</iframe>', 60*60*60 * 1000, 0)
                $float.hide();
            }
        }



        let accessLevel = 0;

        if ((message.params[0] || '').toLowerCase() === '#is2511') { // Mods in #is2511 are global mods
            // console.log(message);
            if (typeof (message.tags.badges) === 'string') {
                message.tags.badges.split(',').forEach(badge => {
                    badge = badge.split('/');
                    if (badge[0] === 'moderator') {
                        accessLevel = 700;
                    }
                });
            }
            // console.log('YEP cmd from #is2511, access = ', accessLevel, ' nick = ' + nick);
        }
        if (Chat.cache.globalMods.includes(nick.toLowerCase())) accessLevel = 700;

        if (typeof(Chat.cache.badges[nick.toLowerCase()]) === 'string') {
            Chat.cache.badges[nick.toLowerCase()].split(',').forEach(badge => {
                badge = badge.split('/');
                if (badge[0] === 'moderator' && accessLevel === 700)
                    accessLevel = 750; // Global mod + channel mod

                if (accessLevel < 500)
                    if (badge[0] === 'moderator') accessLevel = 500;
                if (accessLevel < 1000)
                    if (badge[0] === 'broadcaster') accessLevel = 1000;
            });
        }
        if ((accessLevel < 1000) && (nick.toLowerCase() === 'arturthefoe'))
            accessLevel = 1000; // global artur perms bruh
            if ((accessLevel < 1000) && (nick.toLowerCase() === 'neomothdev'))
            accessLevel = 1000; // global neomoth/neomothdev perms :SillyCat:
        if ((accessLevel < 700) && (nick.toLowerCase() === 'mmattbtw'))
            accessLevel = 700; // ig lol
        if ((accessLevel < 1000) && (nick.toLowerCase() === 'rjtech')
            && (Chat.info.channel.toLowerCase() === 'greasymac'))
            accessLevel = 1000;
        if (nick.toLowerCase() === 'is2511')
            accessLevel = 2000;



        if (text.toLowerCase().startsWith("!chatis")) {

            if (!isForThisChannel()) return;

            if (accessLevel >= 0) {
                let args = text.split(/\s+/);
                let cmd = args[1];

                if (Chat.info.nocmd.channels.has(Chat.info.channel.toLowerCase())) {
                    if ((accessLevel < 1000) && (!Chat.info.nocmd.whitelist.has(cmd))) {
                        console.debug(`[ChatIS][CMD] #${msgSourceChannel} ${nick} (${accessLevel}): ${text}`);
                        return;
                    }
                }

                console.log(`[ChatIS][CMD] #${msgSourceChannel} ${nick} (${accessLevel}): ${text}`);

                switch (cmd) {
                    case 'ping': {
                        if (accessLevel < 500) return;
                        // Chat.write('[ChatIS]', {}, 'Pong! v' + version);
                        let rng = window.location.href.match(/&random=([0-9]*)/);
                        showFloat(1, 'Pong!\nChatIS v' + version + (rng ? ("\nrandom: " + rng[1]) : ''));
                    }
                        break;
                    case 'link': {
                        if (accessLevel < 1000) return;
                        // Chat.write('[ChatIS]', {}, 'Link: ' + window.location.href);
                        showFloat(1, "[ChatIS] Link:\n" + window.location.href);
                    }
                        break;
                    case 'uuid': {
                        if (accessLevel < 1000) return;
                        // Chat.write('[ChatIS]', {}, 'UUID: ' + Chat.onlineTracker.uuid);
                        showFloat(1, "[ChatIS] UUID:\n" + Chat.onlineTracker.uuid);
                    }
                        break;
                    case 'reload': {
                        if (accessLevel < 500) return;
                        console.info("[ChatIS][CMD] Reloading page...");
                        // let href = window.location.href.replace(/&random=[0-9]*/g, "")
                        // href += '&random=' + Math.floor(Math.random()*1e8);
                        // window.location = href;
                        // TODO: Add option to force cache drop for all resources
                        window.location.reload(true);
                    }
                        break;
                    case 'deploy': {
                        if (accessLevel < 1000) return;
                        let rdelay = parseFloat((text.match(/ --rdelay ([\d.]+)/) || [])[1]) * 1000 || 10 * 1000;
                        setTimeout(function () {
                            window.location.reload();
                        }, Math.random() * rdelay);
                    }
                        break;
                    case 'js': {
                        if (accessLevel < 1500) return;
                        let code = text.substr('!chatis js '.length);
                        let result = makeFunction(code)(this);
                        if (result) showFloat(100, result);
                    }
                        break;
                    case 'refresh': {
                        if (accessLevel < 500) return;

                        if ((args[2] === 'emotes') || !args[2])
                            setTimeout(() => {
                                Chat.reloadEmotes('Manual reload!');
                            }, 100);

                        if (args[2] === 'cosmetics')
                            setTimeout(() => {
                                Chat.reloadCosmetics('Manual reload!');
                            }, 100);
                    }
                        break;
                    case 'stop': {
                        if (accessLevel < 500) return;
                        for (let id in floatStorage) {
                            removeFloat(id);
                        }
                        ttsStorage = ttsStorage.map(function (v) {
                            v.pause();
                            v.remove();
                            return null;
                        });
                        ttsStorage = [];
                    }
                        break;
                    case 'show': {
                        if (accessLevel < 500) return;
                        $('#chat_container').show();
                    } break;
                    case 'hide': {
                        if (accessLevel < 500) return;
                        $('#chat_container').hide();
                    } break;
                    case 'rickroll': {
                        if (!isThisOverlayVisible()) return;
                        if (accessLevel < 500) return;
                        let timeout = parseFloat((text.match(/ -t ([\d.]+)/) || [])[1]) * 1000 || 3 * 1000;
                        if (accessLevel < 1000) timeout = 3 * 1000;
                        showFloat(2,
                            '<iframe ' +
                            'allowFullScreen="allowFullScreen" ' +
                            'src="https://www.youtube.com/embed/dQw4w9WgXcQ' +
                            '?ecver=1&iv_load_policy=1&rel=1&autohide=2&color=red&autoplay=1" ' +
                            'width="' + vw + '" height="' + vh + '" ' +
                            'allowtransparency="true" ' +
                            'frameborder="0">' +
                            '</iframe>', timeout, 0);
                    }
                        break;
                    case 'img': { // Weest: lower 250px, top ~150px
                        if (accessLevel < 500) return;
                        // console.log(nick, message);
                        if (args[2] === 'clear') {
                            removeFloat(4);
                            break;
                        }
                        let link = (text.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/) || [])[1];
                        if (!link)
                            link = (Chat.info.emotes[
                                ( text.substr('!chatis img '.length).match(/([^\s]+)/) || [] )[1] || ''
                                ] || {}).image;
                        let pAR = (text.match(/ -(x)/) || [])[1] || false; // Preserve Aspect Ratio
                        let fg = (text.match(/ -(f)/) || [])[1] || false; // Make the image foreground (bg by default)
                        let heightMatch = (text.match(/ -h ([\d]+)/) || [])[1];
                        let height = parseInt(heightMatch) || vh;
                        let widthMatch = (text.match(/ -w ([\d]+)/) || [])[1];
                        let width = parseInt(widthMatch) || vw;
                        // let width = parseInt((text.match(/ -w ([\d]+)/) || [])[1]) || vw;
                        let opacity = parseFloat((text.match(/ -o ([\d.]+)/) || [])[1]) || 1;
                        let timeout = parseFloat((text.match(/ -t ([\d.]+)/) || [])[1]) * 1000 || 3 * 1000;
                        if (accessLevel < 1000) {
                            timeout = Math.min(timeout, 60 * 60 * 1000); // 1h
                            if (opacity > 0.301)
                                timeout = Math.min(timeout, 20 * 1000); // 20s
                        }
                        if (!link) {
                            link = 'https://i.imgur.com/XoZbiQH.gif';
                            timeout = 1.5 * 1000; // Single loop of the gif
                            // opacity = 1;
                        }
                        if (!widthMatch) width = width - (vw * 0.02);
                        if (!heightMatch) height = height - (vh * 0.02);
                        if (!Chat.pARfunc) Chat.pARfunc = function (img) {
                            let nw = img.naturalWidth; let nh = img.naturalHeight;
                            if (heightMatch) {
                                width = nw * (height/nh);
                            } else if (widthMatch) {
                                height = nh * (width/nw);
                            } else {
                                width = nw;
                                height = nh;
                            }
                            img.width = width; img.height = height;
                        };
                        showFloat(4,
                            '<img ' +
                            'src="' + link + '" ' +
                            (pAR ? 'onload="Chat.pARfunc(this)" ' : '') +
                            'width="' + width + '" height="' + height + '" ' +
                            'style="opacity: ' + opacity + ';"' +
                            '/>', timeout, 0, fg ? 0 : -10);
                    }
                        break;
                    case 'HORSING': {
                        if (accessLevel < 500) return;
                        // console.log(nick, message);
                        let link = 'https://cdn.7tv.app/emote/61241367ca26708cad4a1ea6/4x.webp'; // HORSING
                        let pAR = (text.match(/ -(x)/) || [])[1] || false; // Preserve Aspect Ratio
                        // pAR = !pAR; // true by default
                        let fg = (text.match(/ -(f)/) || [])[1] || false; // Make the image foreground (bg by default)
                        let heightMatch = (text.match(/ -h ([\d]+)/) || [])[1];
                        let height = parseInt(heightMatch) || vh;
                        let widthMatch = (text.match(/ -w ([\d]+)/) || [])[1];
                        let width = parseInt(widthMatch) || vw;
                        let opacity = parseFloat((text.match(/ -o ([\d.]+)/) || [])[1]) || 0.15;
                        if (accessLevel < 1000) {
                            if (opacity > 0.3) opacity = 0.3;
                        }
                        let timeout = parseFloat((text.match(/ -t ([\d.]+)/) || [])[1]) * 1000 || 60 * 1000;
                        if (accessLevel < 1000) {
                            timeout = Math.min(timeout, 3600 * 1000);
                        }
                        if (!widthMatch) width = width - (vw * 0.02);
                        if (!heightMatch) height = height - (vh * 0.02);
                        if (!Chat.pARfunc) Chat.pARfunc = function (img) {
                            let nw = img.naturalWidth; let nh = img.naturalHeight;
                            if (heightMatch) {
                                width = nw * (height/nh);
                            } else if (widthMatch) {
                                height = nh * (width/nw);
                            } else {
                                width = nw;
                                height = nh;
                            }
                            img.width = width; img.height = height;
                        };
                        showFloat(6,
                            '<img ' +
                            'src="' + link + '" ' +
                            (pAR ? 'onload="Chat.pARfunc(this)"' : '') +
                            'width="' + width + '" height="' + height + '" ' +
                            'style="opacity: ' + opacity + ';"' +
                            '</img>', timeout, 0, fg ? 0 : -10);
                    }
                        break;
                    case 'yt': { // TODO: Move to youtube API to embed
                        if (!isThisOverlayVisible()) return;
                        if (accessLevel < 1000) return;
                        let match = (text.match(/(?:https?:\/\/(?:www\.)?)?youtu(?:be\.com\/(?:embed\/)?watch\?(?:&?feature=\w+&?)?v=|\.be\/)([\w\-\_]*)(?:&(?:amp;)?[\w\?=]*)?(?:(?:&|\?)?t=([\ddhms]+))?/) || []);
                        let ytId, ytTime;
                        ytId = match[1];
                        ytTime = match[2];
                        let mute = (text.match(/ -(m)/) || [])[1] || false;
                        let hide = (text.match(/ --(hide)/) || [])[1] || false;
                        let height = parseInt((text.match(/ -h ([\d]+)/) || [])[1]) || vh;
                        let width = parseInt((text.match(/ -w ([\d]+)/) || [])[1]) || vw;
                        let timeout = parseFloat((text.match(/ -t ([\d.]+)/) || [])[1]) * 1000 || 3 * 1000;
                        if (accessLevel < 1000) {
                            timeout = Math.min(timeout, 20 * 1000);
                        }
                        if (!ytId) {
                            let ytPresets = {
                                'win-plug': '9omajpF7v-o', // 3s; Windows 10/8 Device Connect Sound
                                'win-unplug': 'OOJi5zm9GYQ', // 3s; Windows 10/ Windows 8 Device Disconnect Sound
                                'win-error': 'v76-ChTSLJk', // 3s; Windows 10 Error Sound
                                'bruh': '2ZIpFytCSVc', // 2s; Bruh Sound Effect #2
                                'vine-boom': '_vBVGjFdwk4', // 3s; Vine Boom Sound Effect (Longer Version For Real)
                                'dc-ping': 'jiWj1zZlRjQ', // 1s; Discord Ping Sound Effect
                                'rickroll': 'dQw4w9WgXcQ', // Rickroll lol
                                'kickball': 'qmTU1KpVR9c', // 2s; Kickball sound effect
                                'skype-login': 'pPyZDk9DYe0', // 3s; Skype Log In Sound FX YouTube
                                'skype-msg': 'KrlkEv26Gls', // 1s; Skype Notification Sound
                                'notif-spam': 'P_fhU5XsmuQ', // 72s (1m12s); epic notification spam
                                'steam-msg': 'umYZyPRE0g4', // 2s; Steam Message (SOUND)
                            };
                            if (ytPresets[args[2]])
                                ytId = ytPresets[args[2]];
                            else
                                return;
                        }
                        width = width - (vw * 0.02);
                        height = height - (vh * 0.02);
                        showFloat(5,
                            '<iframe ' +
                            'allowFullScreen="allowFullScreen" ' +
                            'src="https://www.youtube.com/embed/' + ytId +
                            '?ecver=1&iv_load_policy=1&rel=1&autohide=2&color=red&autoplay=1' +
                            (mute ? '&mute=1' : '') +
                            (ytTime ? ('&start=' + ytTime) : '') + '" ' +
                            'width="' + width + '" height="' + height + '" ' +
                            'style="' + (hide ? 'visibility: hidden;' : '') + '" ' +
                            'allowtransparency="true" ' +
                            'frameborder="0">' +
                            '</iframe>', timeout, 0);
                    }
                        break;
                    case 'tts-reads-chat': {
                        if (!isThisOverlayVisible()) return;
                        if (accessLevel < 1000) return;

                        if (args[2] === 'on') {
                            Chat.info.ttsReadsChat = true;
                        } else if (args[2] === 'off') {
                            Chat.info.ttsReadsChat = false;
                        } else {
                            Chat.info.ttsReadsChat = !Chat.info.ttsReadsChat;
                        }
                    } break;
                    case 'tts': {
                        if (Chat.info.ttsReadsChat)
                            accessLevel = 500;
                        if (!isThisOverlayVisible()) return;
                        // if (Chat.info.channel.toLowerCase() === 'mmattbtw') accessLevel = 500;
                        if (accessLevel < 500) return;
                        if (Chat.info.channel.toLowerCase() === 'weest') {
                            if (accessLevel === 700) return;
                        }
                        // let url = 'https://streamlabs.com/polly/speak';
                        let url = 'https://chatis.is2511.com/v2/tts/';
                        let volumeMatch = text.match(/ -v ([\d.]+)/);
                        let volume = parseFloat((volumeMatch || [])[1]) || 0.5;
                        let voiceMatch = text.match(/ -s ([\S]+)/);
                        let voice = (voiceMatch || [])[1] || 'Brian';
                        if (voiceMatch) {
                            text = text.substr(0, voiceMatch.index)
                                + text.substr(voiceMatch.index + voiceMatch[0].length);
                        }
                        if (volumeMatch) {
                            text = text.substr(0, volumeMatch.index)
                                + text.substr(volumeMatch.index + volumeMatch[0].length);
                        }
                        text = text.substr('!chatis tts '.length);

                        const speakUsingUrl = function (speakUrl) {
                            let id = ttsStorage.push(new Audio(speakUrl)) - 1;
                            ttsStorage[id].addEventListener('canplaythrough', () => {
                                ttsStorage[id].volume = volume;
                                ttsStorage[id].play();
                            });
                            ttsStorage[id].addEventListener('ended', () => {
                                ttsStorage[id].remove();
                                ttsStorage[id] = null;
                            });
                        }

                        if (Chat.cache.tts.has(text)) {
                            let speakUrl = Chat.cache.tts.get(text);
                            speakUsingUrl(speakUrl);
                        } else {
                            let init = {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json;charset=UTF-8'},
                                mode: 'no-cors',
                                body: JSON.stringify({
                                    voice: voice,
                                    text: text
                                }),
                            };
                            fetch(url, init).then(function (response) {
                                if (response.status !== 200)
                                    throw new Error('StreamLabsAPI error: ' + response);

                                return response.json();
                            }).then((data) => {
                                // console.log(data);
                                if (!data.success)
                                    throw new Error('StreamLabsAPI failed:', data)

                                let responseSpeakUrl = (data || {}).speak_url;
                                if (responseSpeakUrl) {
                                    let speakUrl = responseSpeakUrl;
                                    Chat.cache.tts.set(text, speakUrl);
                                    speakUsingUrl(speakUrl);
                                }
                            }).catch(function (reason) {
                                throw new Error('TTS error! Reason: ' + reason);
                            });
                        }

                    }
                        break;
                    case 'break':
                        // jchatBreak();
                        // setTimeout(() => {}, 10*1000);
                        break;
                }
            }
        }

        // Backwards compatability with !refreshoverlay
        // Ease of use with GuysRefreshChatterinoIUploadedAnotherEmote
        if (message.params[1].startsWith("!refreshoverlay")
            || message.params[1].startsWith("GuysRefreshChatterinoIUploadedAnotherEmote")) {
            if (!isForThisChannel()) return;
            let flag = false;
            if (typeof(message.tags.badges) === 'string') {
                message.tags.badges.split(',').forEach(badge => {
                    badge = badge.split('/');
                    if (badge[0] === "moderator" || badge[0] === "broadcaster") {
                        flag = true;
                        return;
                    }
                });
            }
            if (nick.toLowerCase() === "is2511") flag = true;
            if (nick.toLowerCase() === "arturthefoe") flag = true;
            if (flag || (accessLevel >= 500)) {
                setTimeout(() => {
                    Chat.reloadEmotes('Manual reload!');
                }, 100);
            }
        }


    },

    connect: function(channel) {

        Chat.info.channel = channel;
        var title = $(document).prop('title');
        $(document).prop('title', title + Chat.info.channel);

        Chat.obs = {
            thisVisible: 'nothing yet',
            controlLevel: {
                NONE: 0,
                READ_ONLY: 1,
                BASIC: 2,
                ADVANCED: 3,
                ALL: 4
            },
            getControlLevel: () => {
                return new Promise((resolve, reject) => {
                    if (!window.obsstudio) resolve(Chat.obs.controlLevel.NONE);
                    if (!window.obsstudio.getControlLevel) resolve(Chat.obs.controlLevel.NONE);
                    window.obsstudio.getControlLevel((x) => {
                        resolve(x);
                    });
                    setTimeout(() => { resolve(Chat.obs.controlLevel.NONE) }, 1000);
                });
            },
            getStatus: () => {
                // TODO: Check if we have enough perms and ask for more if we don't?
                let controlLevel = Chat.obs.getControlLevel();
                return new Promise((resolve, reject) => {
                    if (!window.obsstudio) resolve(null);
                    if (!window.obsstudio.getStatus) resolve(null);
                    // if (controlLevel < Chat.obs.controlLevel.READ_ONLY)
                    //     resolve(null);
                    window.obsstudio.getStatus((x) => {
                        resolve(x);
                    });
                    setTimeout(() => { resolve(null) }, 1000);
                });
            }
        }

        if (window.obsstudio) {
            window.addEventListener('obsSourceVisibleChanged', function(event) {
                Chat.obs.thisVisible = event.detail.visible;
            });

            window.addEventListener('obsStreamingStarted', function(event) {
                Chat.onlineTracker.interval.func('obs', 'obsStreamingStarted');
            });
            window.addEventListener('obsStreamingStopped', function(event) {
                Chat.onlineTracker.interval.func('obs', 'obsStreamingStopped');
            });
            window.addEventListener('obsExit', function(event) {
                // This could be fast enough, but I have no idea how much time it takes to exit obs.
                //  And I don't know if there is a way to block obs until the request is finished.
                //  So this is the "best chance" to shove a request before obs exits.
                //  This should not be needed anyway since the 'beforeunload' should fire before this.
                // navigator.sendBeacon(new URL('?'
                //     + 'channel=' + encodeURIComponent(Chat.info.channel)
                //     + (Chat.info.channelID ? ('bcId=' + Chat.info.channelID) : '')
                //     + '&obs=' + (window.obsstudio ? 'true' : 'false')
                //     + '&uuid=' + encodeURIComponent(Chat.onlineTracker.uuid)
                //     + '&event=obs' + '&obsEvent=obsExit'
                //     + '&v=2',
                //     Chat.onlineTracker.interval.base));
                // Scratch that, let's try the better case first.
                Chat.onlineTracker.interval.func('obs', 'obsExit');
            });


            addEventListener("beforeunload", () => {
                // if (Chat.onlineTracker.enabled)
                // Still needed even though obsExit exists, obsExit might not be fired if not enough permissions.
                // This should work even if we have zero permissions, but could result in request spam if user has
                //  the "Unload when not on screen" flag enabled.
                // Btw this request is missing the JSON body, but it shouldn't matter.
                //  The lifetime of the overlay is ending anyway since this is a reload/unload. New UUID, etc.
                navigator.sendBeacon(new URL('?'
                    + 'channel=' + encodeURIComponent(Chat.info.channel)
                    + (Chat.info.channelID ? ('&bcId=' + Chat.info.channelID) : '')
                    + '&obs=' + (window.obsstudio ? 'true' : 'false')
                    + '&uuid=' + encodeURIComponent(Chat.onlineTracker.uuid)
                    + '&event=unload'
                    + '&v=2',
                    Chat.onlineTracker.interval.base));
            });

        }

        Chat.onlineTracker = {};
        Chat.onlineTracker.uuidv4 = () => {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
        Chat.onlineTracker.uuid = Chat.onlineTracker.uuidv4();
        Chat.onlineTracker.enabled = true;
        Chat.onlineTracker.interval = {};
        Chat.onlineTracker.interval.timout = 1000*60*30; // 30 minutes
        Chat.onlineTracker.interval.counter = 1;
        Chat.onlineTracker.interval.start = Date.now();
        Chat.onlineTracker.interval.base = 'https://chatis.is2511.com/v2/control/report/';
        Chat.onlineTracker.interval.func = async (eventType, obsEvent) => {
            if (!Chat.onlineTracker.enabled) return;
            if (!eventType) eventType = 'timer'; // also possible: 'obs', 'load', 'unload'
            Chat.onlineTracker.interval.query = '?'
                + 'channel=' + encodeURIComponent(Chat.info.channel)
                + (Chat.info.channelID ? ('&bcId=' + Chat.info.channelID) : '')
                + '&obs=' + (window.obsstudio ? 'true' : 'false')
                + '&uuid=' + encodeURIComponent(Chat.onlineTracker.uuid)
                // + '&counter=' + Chat.onlineTracker.interval.counter
                + '&event=' + eventType
                + (eventType === 'obs' ? '&obsEvent=' + obsEvent : '')
                + '&v=2';
            let url = new URL(Chat.onlineTracker.interval.query, Chat.onlineTracker.interval.base);
            let init = {};
            init.method = 'POST';
            init.headers = new Headers();
            init.headers.set('User-Agent', 'ChatIS ' + version);
            init.headers.set('Content-Type', 'application/json');
            init.body = JSON.stringify({
                ChatIS: {
                    version: version,
                    url: window.location.href, // Can be used to extract query and get more consistent config
                    onlineTracker: {
                        uuid: Chat.onlineTracker.uuid,
                        loadedOn: Chat.onlineTracker.interval.start,
                        loadedOnISO: // TODO: Should remove, only used for human readability of JSON file
                            (new Date(Chat.onlineTracker.interval.start)).toISOString(),
                        latestOn: Date.now(), // TODO: Probably should deprecate, the interval will be huge
                        latestOnISO: (new Date(Date.now())).toISOString(), // TODO: Same as above `loadedOnISO`
                        counter: Chat.onlineTracker.interval.counter, // Maybe useless, not sure yet
                        interval: Chat.onlineTracker.interval.timout
                    },
                    obs: (window.obsstudio ? {
                        pluginVersion: window.obsstudio.pluginVersion,
                        controlLevel: (await Chat.obs.getControlLevel()),
                        overlayVisible: Chat.obs.thisVisible,
                        status: (await Chat.obs.getStatus())
                    } : null),
                    config: { // TODO: Remove this, only needed if something can't parse URLs but understands JSON.
                              //  Or, if something doesn't know the URL scheme of params but can easily infer from this.
                              //  This could be useful, but needs cleanup and grouping all config params into one var.
                        channel: Chat.info.channel,
                        animate: Chat.info.animate,
                        bots: Chat.info.bots,
                        hideSpecialBadges: Chat.info.hideSpecialBadges,
                        fade: Chat.info.fade,
                        size: Chat.info.size,
                        font: Chat.info.font,
                        fontCustom: Chat.info.fontCustom,
                        stroke: Chat.info.stroke,
                        shadow: Chat.info.shadow,
                        smallCaps: Chat.info.smallCaps,
                        nlAfterName: Chat.info.nlAfterName,
                        hideNames: Chat.info.hideNames,
                        markdown: Chat.info.markdown,
                        md_image: Chat.info.md_image,
                        botNames: Chat.info.botNames,
                        showHomies: Chat.info.showHomies,
                    }
                },
            });
            fetch(url.toString(), init).then(function (response) {
                if (response.status !== 200) {
                    let responseJson = '[ERROR]';
                    try {
                        responseJson = response.json();
                    } catch (err) {
                        // console.error("OnlineTracker: Failed to parse JSON in answer");
                    }
                    throw new Error('OnlineTracker error: ' + response.status + " " + response.statusText
                        + " | JSON: " + responseJson);
                }
            })
            if (eventType === 'timer')
                Chat.onlineTracker.interval.counter += 1;
        };
        Chat.onlineTracker.interval.id =
            setInterval(() => { Chat.onlineTracker.interval.func() },
                        Chat.onlineTracker.interval.timout);
        // First time connection, "exact" time went online
        setTimeout(Chat.onlineTracker.interval.func, 1000, 'load');



        Chat.load(function () {

            // console.log('ChatIS: Connecting to IRC server...');
            let socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 2000 });

            socket.onopen = function() {
                console.info(`[ChatIS] Connected to #${channel}`);
                socket.send('PASS blah\r\n');
                socket.send('NICK justinfan' + Math.floor(Math.random() * 99999) + '\r\n');
                socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
                socket.send('JOIN #' + channel + '\r\n');
            };

            socket.onclose = function() {
                console.info(`[ChatIS] Disconnected from #${channel}`);
            };

            socket.onmessage = function(data) {
                data.data.split('\r\n').forEach(line => {
                    if (!line) return;
                    let message = window.parseIRC(line);
                    if (!message.command) return;

                    switch (message.command) {
                        case "PING":
                            socket.send('PONG ' + message.params[0]);
                            return;
                        case "JOIN":
                            console.info('[ChatIS] Joined channel #' + channel);
                            $('#loader').hide();
                            return;
                        case "CLEARMSG":
                            if (message.tags) Chat.clearMessage(message.tags['target-msg-id']);
                            return;
                        case "CLEARCHAT":
                            if (message.params[1]) Chat.clearChat(message.params[1]);
                            return;
                        case "PRIVMSG":
                            if (message.params[0] !== '#' + channel || !message.params[1]) return;

                            let nick = message.prefix.split('@')[0].split('!')[0];
                            let text = message.params[1];

                            Chat.cache.badges[nick.toLowerCase()] = message.tags.badges;

                            let madeTts = false;
                            if (Chat.info.ttsReadsChat) {
                                if (!text.startsWith('!chatis ')) {
                                    text = '!chatis tts ' + text;
                                    message.params[1] = text;
                                    madeTts = true;
                                }
                            }

                            Chat.parseCommand(message);

                            if (madeTts) {
                                text = text.substr('!chatis tts '.length);
                                message.params[1] = text;
                            }

                            if (!Chat.info.bots) {
                                let bots = [];
                                // Global recognised bots
                                bots.push('streamelements', 'streamlabs', 'nightbot', 'moobot');
                                // Common bots
                                bots.push('titlechange_bot', 'supibot', 'pajbot', 'huwobot',
                                    'thepositivebot', 'kunszgbot', 'vjbotardo', 'feelsokaybot',
                                    'fossabot', 'scriptorex');
                                // Submitted by Linar (@linaryx@twitch.tv)
                                bots.push('oshbt', 'spanixbot', 'potatbotat', 'streamqbot', 'twirapp');
                                // Some channel bots
                                bots.push(
                                    // Owner: Weest (@weest@twitch.tv)
                                    'roboweest',
                                    // Owner: relaxo (@retrorelaxo@twitch.tv)
                                    'cvk3'
                                )
                                bots = bots.concat(Chat.info.botNames.split(',').flatMap(s => s.trim().split(' ')));
                                bots = bots.map(username => username.toLowerCase());
                                if (bots.includes(nick)) return;

                                let botSubstrings = [];
                                // Common bot prefixes
                                botSubstrings.push('!', '$', 'kb ');
                                // Common bot commands
                                botSubstrings.push('+ed', '+join', '?cookie');

                                // let moneyExceptions = [];
                                // // Common bot prefixes
                                // moneyExceptions.push('$8ball', '$9gag');

                                let cancelMessage = false;

                                for (let i in botSubstrings)
                                    if (message.params[1].toLowerCase().startsWith(botSubstrings[i])) {
                                        cancelMessage = true;
                                        // for (let j in moneyExceptions)
                                        //     if (message.params[1].toLowerCase().startsWith(moneyExceptions[j]))
                                        //         cancelMessage = true;
                                        if (message.params[1].toLowerCase().charAt(0) === '$')
                                            if (!isNaN(parseFloat(message.params[1].toLowerCase().split(' ')[0].substr(1)))) {
                                                cancelMessage = false;
                                                break;
                                            }
                                        break;
                                    }

                                if (cancelMessage) return;

                            }

                            if (!Chat.info.hideSpecialBadges) {
                                if (Chat.info.bttvBadges
                                    // && Chat.info.seventvBadges
                                    && Chat.info.chatterinoBadges
                                    && Chat.info.ffzapBadges
                                    && !Chat.info.userBadges[nick]) {
                                    Chat.loadUserBadges(nick, message.tags['user-id']);
                                }
                            }

                            if (Chat.info.singleChatter) {
                                if (Chat.info.singleChatter !== nick.toLowerCase())
                                    return;
                            }

                            Chat.write(nick, message.tags, message.params[1]);
                            return;
                    }
                });
            };

        });
    }
};

Chat.connectForCommands = function(channel) {

    let socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 2000 });

    socket.onopen = function() {
        console.info(`[ChatIS] Connected to #${channel} (commands)`);
        socket.send('PASS blah\r\n');
        socket.send('NICK justinfan' + Math.floor(Math.random() * 99999) + '\r\n');
        socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
        socket.send('JOIN #' + channel + '\r\n');
    };

    socket.onclose = function() {
        console.info(`[ChatIS] Disconnected from #${channel} (commands)`);
    };

    socket.onmessage = function(data) {
        data.data.split('\r\n').forEach(line => {
            if (!line) return;
            let message = window.parseIRC(line);
            if (!message.command) return;

            switch (message.command) {
                case "PING":
                    socket.send('PONG ' + message.params[0]);
                    return;
                case "JOIN":
                    console.info(`[ChatIS] Joined channel #${channel} (commands)`);
                    return;
                case "PRIVMSG":
                    if (message.params[0] !== '#' + channel || !message.params[1]) return;

                    // let text = message.params[1];
                    // let channelParam = text.match(/ -c ([\S]+)/);
                    // if (channelParam.toLowerCase() === channel.toLowerCase()) {
                    //     Chat.parseCommand(message);
                    // }
                    Chat.parseCommand(message, false);

                    return;
            }
        });
    };

}

Chat.reloadEmotes = (msgExtra = '') => {
    showFloat(9, msgExtra + '\nReloading emotes...', 10*1000);
    console.info('[ChatIS] Reloading emotes...');
    Chat.loadEmotes(Chat.info.channelID).then(
        () => {
            showFloat(9, 'Reloading emotes... Done!', 1000);
        },
        () => {
            showFloat(9, 'Reloading emotes... FAILED!?', 2*1000);
        },
    );
}

Chat.reloadCosmetics = (msgExtra = '') => {
    showFloat(11, msgExtra + '\nReloading cosmetics...', 10*1000);
    console.info('[ChatIS] Reloading cosmetics...');
    Chat.loadCosmetics(Chat.info.channelID).then(
        () => {
            showFloat(11, 'Reloading cosmetics... Done!', 1000);
        },
        () => {
            showFloat(11, 'Reloading cosmetics... FAILED!?', 2*1000);
        },
    );
}



$(document).ready(function() {
    Chat.connect($.QueryString.channel ? $.QueryString.channel.toLowerCase() : 'xqc');
    if ($.QueryString.channel.toLowerCase() !== 'is2511')
        Chat.connectForCommands('is2511');
    let rng = window.location.href.match(/&random=([0-9]*)/);
    console.info(`[ChatIS] Loading... v${version}`);
    showFloat(1, 'ChatIS v' + version
        + (rng ? ("\nrandom: " + rng[1]) : ''), 5*1000);
});
