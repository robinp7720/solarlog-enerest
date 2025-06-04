import Axios from 'axios';

export default class SolarLogOnline {
    constructor(portal, {
        baseURL = "https://api.enerest.world",
        authURL = "https://auth.enerest.world",
    }) {

        this.portal = portal;
        this.baseURL = baseURL;
        this.authURL = authURL;

        this.axios = Axios.create({
            baseURL,
            headers: {
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.7,de-DE;q=0.3",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Priority": "u=0"
            }
        });
    }

    async login(client_id, client_secret) {
        const res = await this.axios.post(`${this.authURL}/auth/realms/quotaapi/protocol/openid-connect/token`,
            {
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret
            },
            {
                headers: {
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.7,de-DE;q=0.3",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                    "Priority": "u=0"
                }
            });

        this.access_token = res.data.access_token;

        this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`;
    }

    async components(plantId, date) {
        const res = await this.axios.get(`/api/v1/${this.portal}/datasource/plant/${plantId}/components/${date}`, {});
        return res.data;
    }

    async crossEpochChannels(plantId, xComponentIds, channelNames, dateFrom, dateTo) {
        const params = {
            xComponentIds: xComponentIds,
            channelNames: channelNames,
            dateFrom: dateFrom,
            dateTo: dateTo
        };
        const res = await this.axios.get(`/api/v1/${this.portal}/visualization/plant/${plantId}/cross-epoch/channels`, { params });
        return res.data;
    }

    async channels(plantId, dateFrom, dateTo, channelNames, mppTrackerIds) {
        const params = {
            dateFrom: dateFrom,
            dateTo: dateTo,
            channelNames: channelNames,
            mppTrackerIds: mppTrackerIds
        };
        const res = await this.axios.get(`/api/v1/${this.portal}/visualization/plant/${plantId}/channels`, { params });
        return res.data;
    }

    async get_inverters(plantId, date) {
        const components = await this.components(plantId, date);

        const inverters = components.filter(component => component.type === 'Inverter');

        return inverters;
    }

    async get_channel_data_month(plantId, year, month, channelNames) {
        const params = {
            channelNames: channelNames
        };

        const res = await this.axios.get(`/api/v1/${this.portal}/visualization/plant/${plantId}/year/${year}/month/${month}`, {params});
        return res.data;
    }

    async get_channel_data_year(plantId, year, channelNames) {
        const params = {
            channelNames: channelNames
        };

        const res = await this.axios.get(`/api/v1/${this.portal}/visualization/plant/${plantId}/year/${year}`, {params});
        return res.data;
    }

    async get_channel_data_lifetime(plantId, channelNames) {
        const params = {
            channelNames: channelNames
        };

        const res = await this.axios.get(`/api/v1/${this.portal}/visualization/plant/${plantId}/lifetime`, {params});
        return res.data;
    }


    async get_combined_inverter_data(plantId, inverters, dateFrom, dateTo) {
        const epoch_res = await this.crossEpochChannels(
            plantId,
            inverters,
            ["ProdPdc", "ProdEtotal"],
            dateFrom,
            dateTo
        );

        const data = {};

        for (const item of epoch_res) {
            const index = item.name + "_" + item.date;

            if (!data[index]) {
                data[index] = item.dataPoints;
                continue;
            }

            for (const i in item.dataPoints) {
                if (data[index][i] === null) continue;

                data[index][i] += item.dataPoints[i];
            }
        }

        return data;
    }
}
