import api from "../axios";
import apiEndpoints from "../apiEndPoints";

/**
 * Function makes api call to retrieve an array of users (number of users = items_per_page).
 * 
 * Pagination is expected to handle the returned data.
 * 
 * Given wrong parameters defaults will be used (it will not return an error).
 * 
 * @todo UPDATE THIS DOCSTRING
 * @param {object} data 
 * @param {number} [data.page_nr = 1] integer, must be positive
 * @param {number} [data.items_per_page = 25] integer between 5 and 50, must be multiple of 5
 * @param {string} [data.order_by = "last_seen"] enum: ["last_seen", "name", "email", "created_at"]
 * @param {string} [data.order_sort = "descending"] enum: ["descending", "ascending"]
 * @param {string} [data.filter_by = "none"] enum: ["none", "is_blocked"]
 * @returns {object}
 * 
 * @example
 * //Input example:
 * const data = {
 *     page_nr: 1,
 *     order_by: "name"
 * }
 * 
 * //Response example:
 * {
 *  response: "success"
 *  users: [
 *      {
 *        uuid: "3f61108854cd4b5886401080d681dd96",
 *        name: "Josy",
 *        email: "josy@example.com",
 *        last_seen: "Thu, 25 Jan 2024 00:00:00 GMT",
 *        is_blocked: "false"
 *      },
 *      ...
 *  ]
 *  total_pages: 3,
 *  current_page: 1,
 *  query: {
 *    page_nr: 1,
 *    items_per_page: 25,
 *    ordered_by: "name",
 *    order_sort: "descending",
 *    filter_by: "none"
 *  }
 * }
 */
export function getAllUsers(data = {}) {

    const ORDER = ["last_seen", "name", "email", "created_at"]
    const SORT = ["descending", "ascending"]
    const FILTER = ["none", "is_blocked"]

    let pageNr = (data.page_nr && Number.isInteger(data.page_nr) && data.page_nr >= 1) ? data.page_nr : 1;
    let itemsPerPage = (data.items_per_page && Number.isInteger(data.items_per_page) && data.items_per_page >= 5 && data.items_per_page <= 50 && data.items_per_page % 5 === 0) ? data.items_per_page : 25;
    let orderBy = (data.order_by && ORDER.includes(data.order_by)) ? data.order_by : "last_seen";
    let orderSort = (data.order_sort && SORT.includes(data.order_sort)) ? data.order_sort : "descending";
    let filterBy = (data.filter_by && FILTER.includes(data.filter_by)) ? data.filter_by : "none"

    let requestData = {
        "page_nr": pageNr,
        "items_per_page": itemsPerPage,
        "order_by": orderBy,
        "order_sort": orderSort,
        "filter_by": filterBy
    }

    const getData = async () => {
        try {
            const response = await api.post(apiEndpoints.adminGetUsersTable, requestData)
            if (response.status === 200 && response.data.users.length > 0) {
                const javaScriptifiedUserFields = response.data.users.map(user => {
                    const { last_seen: lastSeen, is_blocked: isBlocked, ...rest } = user;
                    // Format lastSeen date
                    const formattedLastSeen = new Date(lastSeen).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    });
                    return {
                        ...rest,
                        lastSeen: formattedLastSeen,
                        isBlocked,
                    };
                });
                return {
                    users: javaScriptifiedUserFields,
                    totalPages: response.data.total_pages,
                    currentPage: response.data.current_page
                }
            } else if (response.status === 200 && response.data.users.length === 0) {
                return {
                    users: [],
                    totalPages: response.data.total_pages,
                    currentPage: response.data.current_page
                }
            } else {
                return {
                    users: [],
                    totalPages: null,
                    currentPage: null
                }
            }
        }
        catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    return getData()
}