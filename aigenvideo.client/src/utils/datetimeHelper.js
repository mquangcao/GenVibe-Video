const toUtcStartOfDay = (date) => (date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) : null);

const toUtcEndOfDay = (date) => (date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)) : null);

export { toUtcStartOfDay, toUtcEndOfDay };
