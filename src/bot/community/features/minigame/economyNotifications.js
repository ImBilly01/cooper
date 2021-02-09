import ChannelsHelper from "../../../core/entities/channels/channelsHelper";
import STATE from "../../../state";

export default class EconomyNotifications {
  
    static add(eventType, eventData = {}) {
        if (eventType === 'WOODCUTTING') this.updateWoodcutting(eventData);
        if (eventType === 'MINING') this.updateMining(eventData);

        // These two need further work:
        if (eventType === 'EGG_HUNT') this.updateEgghunt(eventData);
        if (eventType === 'CRATE_DROP') this.updateCrateDrop(eventData);
    }

    static updateCrateDrop(crateDropEvent) {
        console.log(crateDropEvent);
    }

    static updateEgghunt(egghuntEvent) {
        const userID = egghuntEvent.playerID;

        console.log(egghuntEvent);

        if (typeof STATE.EVENTS_HISTORY['EGG_HUNT'] === 'undefined') {
            STATE.EVENTS_HISTORY['EGG_HUNT'] = {
                users: {

                },
                totals: {
                    average: egghuntEvent.type || 0,
                    rare: egghuntEvent.type || 0,
                    legendary: egghuntEvent.type || 0,
                    toxic: egghuntEvent.type || 0,
                    fried: egghuntEvent.type || 0,
                    broken: egghuntEvent.brokenEgg || 0,
                    points: egghuntEvent.pointGain || 0,
                    exploded: egghuntEvent.exploded || 0
                }
            }
        }

        // Add or update user specific stats
        if (typeof STATE.EVENTS_HISTORY['EGG_HUNT'].users[userID] === 'undefined') {
            STATE.EVENTS_HISTORY['EGG_HUNT'].users[userID] = {
                username: egghuntEvent.username,
                average: egghuntEvent.type || 0,
                rare: egghuntEvent.type || 0,
                legendary: egghuntEvent.type || 0,
                toxic: egghuntEvent.type || 0,
                fried: egghuntEvent.type || 0,
                broken: egghuntEvent.brokenEgg || 0,
                points: egghuntEvent.pointGain || 0,
                exploded: egghuntEvent.exploded || 0
            }

        } else {
            if (typeof egghuntEvent.pointGain !== 'undefined')
                STATE.EVENTS_HISTORY['EGG_HUNT'].users[userID].points += egghuntEvent.pointGain;

            if (typeof egghuntEvent.average !== 'undefined')
                STATE.EVENTS_HISTORY['EGG_HUNT'].users[userID].average += egghuntEvent.recWood;

            if (typeof egghuntEvent.brokenAxes !== 'undefined')
                STATE.EVENTS_HISTORY['EGG_HUNT'].users[userID].brokenAxes += egghuntEvent.recWood;
        }

        // Update total data

        if (typeof egghuntEvent.pointGain !== 'undefined')
            STATE.EVENTS_HISTORY['EGG_HUNT'].totals.points += egghuntEvent.pointGain;

        if (typeof egghuntEvent.cut !== 'undefined')
            STATE.EVENTS_HISTORY['EGG_HUNT'].users[userID].cut += egghuntEvent.recWood;

        if (typeof egghuntEvent.brokenAxes !== 'undefined')
            STATE.EVENTS_HISTORY['EGG_HUNT'].totals.brokenAxes += egghuntEvent.brokenAxes;
    }

    static post() {
        const eventStatusesKeys = Object.keys(STATE.EVENTS_HISTORY);
        if (eventStatusesKeys.length > 0) {
            let notificationString = 'Latest actions for you! ';
            
            if (STATE.EVENTS_HISTORY['WOODCUTTING']) {
                const woodcutting = STATE.EVENTS_HISTORY['WOODCUTTING'];
                
                console.log(woodcutting);

                notificationString += `**Latest Woodcutting Totals:**\n` +
                    // `Hits: ${mining.totals.hits}\n` +
                    `Cut: ${woodcutting.totals.cut}\n` +
                    `Broken Pickaxes: ${woodcutting.totals.brokenAxes}\n` +
                    `Points Change: ${woodcutting.totals.points}\n`;
                // users: {
                //     652007124787789828': { points: 56, username: 'hebedebe', cut: 6, brokenAxes: 0 }
                // },
                //     totals: { cut: 6, brokenAxes: 0, points: 112 }
                // }
            }

            if (STATE.EVENTS_HISTORY['MINING']) {
                const mining = STATE.EVENTS_HISTORY['MINING'];
                console.log(mining);

                // notificationString += '\nHad mining stats';

                // Format the mining data.

                notificationString += `\n\n**Latest Mining Totals:**\n` +
                    `Hits: ${mining.totals.hits}\n` +
                    `Mined: ${mining.totals.mined}\n` +
                    `Diamonds: ${mining.totals.diamonds}\n` +
                    `Broken Pickaxes: ${mining.totals.brokenPickaxes}\n` +
                    `Points Change: ${mining.totals.points}\n`;

                // {
                // users: {
                //     652007124787789828': {
                //         points: -2,
                //         username: 'hebedebe',
                //         mined: 0,
                //         brokenPickaxes: 1,
                //         diamondsFound: 0
                //     }
                // },
            }

            // TODO: Add egg hunt stats
            // if (STATE.EVENTS_HISTORY['EGG_HUNT']) {
            //     notificationString += '\nHad mining stats';
            //     console.log(STATE.EVENTS_HISTORY['EGG_HUNT']);
            // }

            // TODO: Add cratedrop stats
            // if (STATE.EVENTS_HISTORY['CRATE_DROP']) {
            //     notificationString += '\nHad mining stats';
            //     console.log(STATE.EVENTS_HISTORY['CRATE_DROP']);
            // }

            ChannelsHelper._postToChannelCode('ACTIONS', notificationString);

            this.clear('WOODCUTTING');
            this.clear('MINING');
            this.clear('EGG_HUNT');
            this.clear('CRATE_DROP');
        }
    }
    
    static clear(type) {
        if (typeof STATE.EVENTS_HISTORY[type] !== 'undefined');
            delete STATE.EVENTS_HISTORY[type];
    }


    // EGGS FOUND

    // WOOD CUT

    // ORE MINED
    // DIAMONDS MINED

    // CRATE REWARDS
    // CRATE HIT
    // CRATE OPEN

    // ITEMS USED (Intercept items helper)


    static updateMining(miningEvent) {
        const userID = miningEvent.playerID;

        if (typeof STATE.EVENTS_HISTORY['MINING'] === 'undefined') {
            STATE.EVENTS_HISTORY['MINING'] = {
                users: {

                },
                totals: {
                    mined: 0,
                    diamonds: 0,
                    brokenPickaxes: 0,
                    points: 0,
                    hits: 0
                }
            }
        }

        // Add or update user specific stats
        if (typeof STATE.EVENTS_HISTORY['MINING'].users[userID] === 'undefined') {
            STATE.EVENTS_HISTORY['MINING'].users[userID] = {
                points: miningEvent.pointGain,
                username: miningEvent.username,
                mined: miningEvent.recOre || 0,
                brokenPickaxes: miningEvent.brokenPickaxes || 0,
                diamondsFound: miningEvent.diamondsFound || 0,
            }

        } else {
            // otherwise update
            if (typeof miningEvent.pointGain !== 'undefined')
                STATE.EVENTS_HISTORY['MINING'].users[userID].points += miningEvent.pointGain;

            if (typeof miningEvent.brokenPickaxes !== 'undefined')
                STATE.EVENTS_HISTORY['MINING'].users[userID].brokenPickaxes += miningEvent.brokenPickaxes;

            if (typeof miningEvent.diamondsFound !== 'undefined')
                STATE.EVENTS_HISTORY['MINING'].users[userID].diamonds += miningEvent.diamondsFound;

            if (typeof miningEvent.recOre !== 'undefined')
                STATE.EVENTS_HISTORY['MINING'].users[userID].mined += miningEvent.recOre;

            // Diamonds and broken pickaxes
        }

        // Update total data
        // Diamonds and broken pickaxes


        if (typeof miningEvent.pointGain !== 'undefined')
            STATE.EVENTS_HISTORY['MINING'].totals.points += miningEvent.pointGain;

        if (typeof miningEvent.brokenPickaxes !== 'undefined')
            STATE.EVENTS_HISTORY['MINING'].totals.brokenPickaxes += miningEvent.brokenPickaxes;

        if (typeof miningEvent.diamondsFound !== 'undefined')
            STATE.EVENTS_HISTORY['MINING'].totals.diamonds += miningEvent.diamondsFound;

        if (typeof miningEvent.recOre !== 'undefined')
            STATE.EVENTS_HISTORY['MINING'].totals.mined += miningEvent.recOre;

        // Updated every hit, so track hits.
        STATE.EVENTS_HISTORY['MINING'].totals.hits++;
    }

    static updateWoodcutting(woodcuttingEvent) {
        const userID = woodcuttingEvent.playerID;

        console.log(woodcuttingEvent);

        if (typeof STATE.EVENTS_HISTORY['WOODCUTTING'] === 'undefined') {
            STATE.EVENTS_HISTORY['WOODCUTTING'] = {
                users: {

                },
                totals: {
                    cut: woodcuttingEvent.recWood || 0,
                    brokenAxes: woodcuttingEvent.brokenAxes || 0,
                    points: woodcuttingEvent.pointGain || 0
                }
            }
        }

        // Add or update user specific stats
        if (typeof STATE.EVENTS_HISTORY['WOODCUTTING'].users[userID] === 'undefined') {
            STATE.EVENTS_HISTORY['WOODCUTTING'].users[userID] = {
                points: woodcuttingEvent.pointGain,
                username: woodcuttingEvent.username,
                cut: woodcuttingEvent.recWood || 0,
                brokenAxes: woodcuttingEvent.brokenAxes || 0,
            }

        } else {
            if (typeof woodcuttingEvent.pointGain !== 'undefined')
                STATE.EVENTS_HISTORY['WOODCUTTING'].users[userID].points += woodcuttingEvent.pointGain;

            if (typeof woodcuttingEvent.cut !== 'undefined')
                STATE.EVENTS_HISTORY['WOODCUTTING'].users[userID].cut += woodcuttingEvent.recWood;

            if (typeof woodcuttingEvent.brokenAxes !== 'undefined')
                STATE.EVENTS_HISTORY['WOODCUTTING'].users[userID].brokenAxes += woodcuttingEvent.recWood;
        }

        // Update total data

        if (typeof woodcuttingEvent.pointGain !== 'undefined')
            STATE.EVENTS_HISTORY['WOODCUTTING'].totals.points += woodcuttingEvent.pointGain;

        if (typeof woodcuttingEvent.cut !== 'undefined')
            STATE.EVENTS_HISTORY['WOODCUTTING'].users[userID].cut += woodcuttingEvent.recWood;

        if (typeof woodcuttingEvent.brokenAxes !== 'undefined')
            STATE.EVENTS_HISTORY['WOODCUTTING'].totals.brokenAxes += woodcuttingEvent.brokenAxes;
    }

}