/**
 * * @param {object} query 
 * @param {string[]} searchableFields 
 * @param {string[]} sortableFields 
 * @param {object} defaultFilter 
 * @param {string} [defaultSortField='id'] - Field default untuk sorting jika tidak ada 'sortBy'.
 * @returns {object} 
 */
export const buildQueryOptions = (query, searchableFields = [], sortableFields = [], defaultFilter = {}, defaultSortField = 'id') => {
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
        if (!['page', 'limit', 'sortBy', 'order', 'search', 'sort'].includes(key) && query[key] !== undefined) {
            where[key] = query[key];
        }
    }

    let orderBy = {};
    
    // Asumsi: Jika menggunakan ?sort=field:direction, kita harus memprosesnya
    // Karena Anda menggunakan query.sortBy dan query.order, kita akan fokus pada itu.
    const sortBy = query.sortBy;
    const order = query.order?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    if (sortBy && sortableFields.includes(sortBy)) {
        orderBy[sortBy] = order;
    } else if (sortableFields.includes(defaultSortField)) {
        // Gunakan defaultSortField yang baru (misalnya 'borrowDate' untuk Loans)
        orderBy = { [defaultSortField]: 'desc' }; 
    } else {
        // Fallback paling aman jika defaultSortField tidak disediakan atau tidak valid
        orderBy = { id: 'desc' };
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