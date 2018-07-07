import * as request from "request-promise-native";


class PatreonAPI {
  clientID: string;
  clientSecret: string;
  creatorAccessToken: string;
  creatorRefreshToken: string;
  requestOptions: request.RequestPromiseOptions;

  constructor(credentials: PatreonAPICredentials) {
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

  refreshAccessToken(): Promise<object> {
    return new Promise(async (resolve, reject) => {
      try {
        let requestOptions: request.RequestPromiseOptions = {
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

        let response = await request('https://www.patreon.com/api/oauth2/token', requestOptions);

        this.creatorAccessToken = response.access_token;
        this.creatorRefreshToken = response.refresh_token;

        resolve(response);
      }
      catch(e) {
        reject(e);
      }
    });
  }

  getPatrons(): Promise<object> {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await request('https://www.patreon.com/api/oauth2/api/current_user/campaigns', this.requestOptions);

        if (response && response.data && response.included) {
          response = await request(`https://www.patreon.com/api/oauth2/api/campaigns/${response.data[0].id}/pledges`, this.requestOptions);

          let pledges = response.data.filter((data: any) => data.type === 'pledge');
          let users = response.included.filter((inc: any) => inc.type === 'user');

          let patrons = pledges.map((pledge: any) => {
            let id = pledge.relationships.patron.data.id;
            let user = users.filter((user: any) => user.id === pledge.relationships.patron.data.id)[0];

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
      catch(e) {
        reject(e);
      }
    });
  }

  getPatronsDiscord(): Promise<object> {
    return new Promise(async (resolve, reject) => {
      try {
        let patrons: any = await this.getPatrons();

        let patronsDiscord = new Map();
        for (let patron of patrons) {
          if (!patron.discord_id) continue;
          patronsDiscord.set(patron.discord_id, patron);
        }
        resolve(patronsDiscord);
      }
      catch(e) {
        reject(e);
      }
    });
  }
}


interface PatreonAPICredentials {
  clientID: string;
  clientSecret: string;
  creatorAccessToken: string;
  creatorRefreshToken: string;
}


export { PatreonAPI };
