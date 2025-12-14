/**
 * 
 * 
 *
 * @param {object} query 
 * @param {string[]} searchableFields 
 * @param {string[]} sortableFields 
 * @param {object} defaultFilter 
 * @returns {object} 
 */
export const buildQueryOptions = (query, searchableFields = [], sortableFields = [], defaultFilter = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 50); 
    const skip = (page - 1) * limit;

    let where = { ...defaultFilter }; 

    if (query.search && searchableFields.length > 0) {
        const searchString = String(query.search).trim();
        where.OR = searchableFields.map(field => ({
            [field]: {
                contains: searchString,
                mode: 'insensitive', 
            },
        }));
    }

    for (const key in query) {
        if (!['page', 'limit', 'sortBy', 'order', 'search'].includes(key) && query[key] !== undefined) {
            where[key] = query[key];
        }
    }

    let orderBy = {};
    const sortBy = query.sortBy;
    const order = query.order?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    if (sortBy && sortableFields.includes(sortBy)) {
        orderBy[sortBy] = order;
    } else {

        orderBy = { createdAt: 'desc' }; 
    }

    return {
        where,
        orderBy,
        skip,
        take: limit,
        page,
        limit,
    };
};