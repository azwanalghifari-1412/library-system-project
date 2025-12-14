const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';

/**
 * Memeriksa apakah error yang diberikan adalah error constraint unik (duplikasi data).
 * Jika ya, ia akan mengekstrak nama field yang menyebabkan error.
 * * @param {object} error - Objek error yang dilempar oleh Prisma.
 * @returns {string | null} Nama field yang duplikat, atau null jika bukan error P2002.
 */
export const extractUniqueConstraintError = (error) => {
    if (error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR && error.meta?.target) {
        const fields = Array.isArray(error.meta.target) ? error.meta.target : [error.meta.target];
        return fields[0]; 
    }
    return null;
};

/**
 * Membuat pesan error yang lebih user-friendly untuk error duplikasi.
 * @param {string} fieldName 
 * @returns {string} 
 */
export const createDuplicateMessage = (fieldName) => {
    return `The provided ${fieldName} is already in use. Please use a different value.`;
};