import * as request from "request-promise-native";
declare class PatreonAPI {
    clientID: string;
    clientSecret: string;
    creatorAccessToken: string;
    creatorRefreshToken: string;
    requestOptions: request.RequestPromiseOptions;
    constructor(credentials: PatreonAPICredentials);
    refreshAccessToken(): Promise<object>;
    getPatrons(): Promise<object>;
    getPatronsDiscord(): Promise<object>;
}
interface PatreonAPICredentials {
    clientID: string;
    clientSecret: string;
    creatorAccessToken: string;
    creatorRefreshToken: string;
}
export { PatreonAPI };
//# sourceMappingURL=index.d.ts.map