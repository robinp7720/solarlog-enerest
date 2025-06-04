/**
 * SolarLogOnline API Client
 *
 * This class provides an interface to interact with the SolarLog/Enerest API,
 * allowing access to solar plant data including inverters, production metrics,
 * and historical data.
 *
 * @module SolarLogOnline
 */
import Axios from 'axios';

export default class SolarLogOnline {
    /**
     * Creates a new SolarLogOnline client instance
     *
     * @param {string} portal - The portal identifier
     * @param {Object} config - Configuration options
     * @param {string} [config.baseURL="https://api.enerest.world"] - Base URL for API requests
     * @param {string} [config.authURL="https://auth.enerest.world"] - Authentication URL
     */
    constructor(portal, {
        baseURL = "https://api.enerest.world",
        authURL = "https://auth.enerest.world",
    } = {}) {
        this.portal = portal;
        this.baseURL = baseURL;
        this.authURL = authURL;
        this.access_token = null;

        // Default headers used in most requests
        this.defaultHeaders = {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.7,de-DE;q=0.3",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Priority": "u=0"
        };

        // Initialize axios instance with default configuration
        this.axios = Axios.create({
            baseURL,
            headers: this.defaultHeaders
        });
    }

    /**
     * Authenticates with the SolarLog/Enerest API
     *
     * @param {string} client_id - The OAuth client ID
     * @param {string} client_secret - The OAuth client secret
     * @returns {Promise<void>}
     * @throws {Error} If authentication fails
     */
    async login(client_id, client_secret) {
        const res = await this.axios.post(
            `${this.authURL}/auth/realms/quotaapi/protocol/openid-connect/token`,
            {
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret
            },
            { headers: this.defaultHeaders }
        );

        this.access_token = res.data.access_token;
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`;
    }

    // -------------------- Base API Methods --------------------

    /**
     * Fetches plant components for a specific date
     *
     * @param {string} plantId - Plant identifier
     * @param {string} date - Date to fetch components for (format: YYYY-MM-DD)
     * @returns {Promise<Array>} Array of component objects
     */
    async components(plantId, date) {
        const res = await this.axios.get(`/api/v1/${this.portal}/datasource/plant/${plantId}/components/${date}`, {});
        return res.data;
    }

    /**
     * Fetches channel data across components and time periods
     *
     * @param {string} plantId - Plant identifier
     * @param {Array<string>} xComponentIds - Component IDs to query
     * @param {Array<string>} channelNames - Channel names to fetch (e.g., ["ProdPdc", "ProdEtotal"])
     * @param {string} dateFrom - Start date (format: YYYY-MM-DD)
     * @param {string} dateTo - End date (format: YYYY-MM-DD)
     * @returns {Promise<Array>} Cross-epoch channel data
     */
    async crossEpochChannels(plantId, xComponentIds, channelNames, dateFrom, dateTo) {
        const params = {
            xComponentIds,
            channelNames,
            dateFrom,
            dateTo
        };
        const res = await this.axios.get(
            `/api/v1/${this.portal}/visualization/plant/${plantId}/cross-epoch/channels`,
            { params }
        );
        return res.data;
    }

    /**
     * Fetches channel data for specific date range and trackers
     *
     * @param {string} plantId - Plant identifier
     * @param {string} dateFrom - Start date (format: YYYY-MM-DD)
     * @param {string} dateTo - End date (format: YYYY-MM-DD)
     * @param {Array<string>} channelNames - Channel names to fetch
     * @param {Array<string>} [mppTrackerIds] - MPP tracker IDs to filter by
     * @returns {Promise<Array>} Channel data
     */
    async channels(plantId, dateFrom, dateTo, channelNames, mppTrackerIds) {
        const params = {
            dateFrom,
            dateTo,
            channelNames,
            mppTrackerIds
        };
        const res = await this.axios.get(
            `/api/v1/${this.portal}/visualization/plant/${plantId}/channels`,
            { params }
        );
        return res.data;
    }

    /**
     * Fetches channel data for a specific month
     *
     * @param {string} plantId - Plant identifier
     * @param {number|string} year - Year (e.g., 2023)
     * @param {number|string} month - Month (1-12)
     * @param {Array<string>} channelNames - Channel names to fetch
     * @returns {Promise<Array>} Monthly channel data
     */
    async get_channel_data_month(plantId, year, month, channelNames) {
        const params = { channelNames };
        const res = await this.axios.get(
            `/api/v1/${this.portal}/visualization/plant/${plantId}/year/${year}/month/${month}`,
            { params }
        );
        return res.data;
    }

    /**
     * Fetches channel data for a specific year
     *
     * @param {string} plantId - Plant identifier
     * @param {number|string} year - Year (e.g., 2023)
     * @param {Array<string>} channelNames - Channel names to fetch
     * @returns {Promise<Array>} Yearly channel data
     */
    async get_channel_data_year(plantId, year, channelNames) {
        const params = { channelNames };
        const res = await this.axios.get(
            `/api/v1/${this.portal}/visualization/plant/${plantId}/year/${year}`,
            { params }
        );
        return res.data;
    }

    /**
     * Fetches lifetime channel data for a plant
     *
     * @param {string} plantId - Plant identifier
     * @param {Array<string>} channelNames - Channel names to fetch
     * @returns {Promise<Array>} Lifetime channel data
     */
    async get_channel_data_lifetime(plantId, channelNames) {
        const params = { channelNames };
        const res = await this.axios.get(
            `/api/v1/${this.portal}/visualization/plant/${plantId}/lifetime`,
            { params }
        );
        return res.data;
    }

    // -------------------- Utility Methods --------------------

    /**
     * Fetches and filters inverter components for a plant
     *
     * @param {string} plantId - Plant identifier
     * @param {string} date - Date to fetch components for
     * @returns {Promise<Array>} Array of inverter objects
     */
    async get_inverters(plantId, date) {
        const components = await this.components(plantId, date);
        return components.filter(component => component.type === 'Inverter');
    }

    /**
     * Combines data from multiple inverters into a single dataset
     *
     * @param {string} plantId - Plant identifier
     * @param {Array<string>} inverters - Array of inverter crossEpochIds
     * @param {string} dateFrom - Start date (format: YYYY-MM-DD)
     * @param {string} dateTo - End date (format: YYYY-MM-DD)
     * @returns {Promise<Object>} Combined inverter data
     */
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
