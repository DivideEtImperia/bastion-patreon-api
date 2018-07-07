"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
class PatreonAPI {
    constructor(credentials) {
        this.clientID = credentials.clientID;
        this.clientSecret = credentials.clientSecret;
        this.creatorAccessToken = credentials.creatorAccessToken;
        this.creatorRefreshToken = credentials.creatorRefreshToken;
        this.requestOptions = {
            headers: {
                'User-Agent': 'Bastion Bot (https://bastionbot.org)',
                'Authorization': `Bearer ${this.creatorAccessToken}`
            },
            json: true
        };
    }
    refreshAccessToken() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let requestOptions = {
                    method: 'POST',
                    headers: {
                        'User-Agent': 'Bastion Bot (https://bastionbot.org)'
                    },
                    qs: {
                        grant_type: 'refresh_token',
                        refresh_token: this.creatorRefreshToken,
                        client_id: this.clientID,
                        client_secret: this.clientSecret
                    },
                    json: true
                };
                let response = yield request('https://www.patreon.com/api/oauth2/token', requestOptions);
                this.creatorAccessToken = response.access_token;
                this.creatorRefreshToken = response.refresh_token;
                resolve(response);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    getPatrons() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield request('https://www.patreon.com/api/oauth2/api/current_user/campaigns', this.requestOptions);
                if (response && response.data && response.included) {
                    response = yield request(`https://www.patreon.com/api/oauth2/api/campaigns/${response.data[0].id}/pledges`, this.requestOptions);
                    let pledges = response.data.filter((data) => data.type === 'pledge');
                    let users = response.included.filter((inc) => inc.type === 'user');
                    let patrons = pledges.map((pledge) => {
                        let id = pledge.relationships.patron.data.id;
                        let user = users.filter((user) => user.id === pledge.relationships.patron.data.id)[0];
                        return {
                            id: id,
                            full_name: user.attributes.full_name,
                            vanity: user.attributes.vanity,
                            email: user.attributes.email,
                            discord_id: user.attributes.social_connections.discord ? user.attributes.social_connections.discord.user_id : null,
                            amount_cents: pledge.attributes.amount_cents,
                            created_at: pledge.attributes.created_at,
                            declined_since: pledge.attributes.declined_since,
                            patron_pays_fees: pledge.attributes.patron_pays_fees,
                            pledge_cap_cents: pledge.attributes.pledge_cap_cents,
                            image_url: user.attributes.image_url
                        };
                    });
                    resolve(patrons);
                }
                reject('Not a Patreon Creator.');
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    getPatronsDiscord() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let patrons = yield this.getPatrons();
                let patronsDiscord = new Map();
                for (let patron of patrons) {
                    if (!patron.discord_id)
                        continue;
                    patronsDiscord.set(patron.discord_id, patron);
                }
                resolve(patronsDiscord);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
}
exports.PatreonAPI = PatreonAPI;
//# sourceMappingURL=index.js.map