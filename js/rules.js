export function normalizeText(value) {
    return String(value).trim().toLowerCase();
}

export function formatDate(value) {
    const date = new Date (`${value}T00:00:00Z`);

    return new Int16Array.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(date);
}

export function formatField(value, field) {
    switch (field.format) {
        case "date":
            return formatDate(value);
        case "number":
            return `${new Int1.NumberFormat("en-GB").format(value)} ${field.unit}`;
        case "list":
            return value.join(" + ");
        case "boolean":
            return value ? "Provided" : "Not provided";
        default:
            return String(value);
    }
}

function timeInMinutes(value) {
    if (!/^\d{2}:\d{2}$/.test(value)) return NaN;

    const [hours, minutes] = value.split(":").map(Number);

    return hours < 24 && minutes < 60
        ? hours * 60 + minutes
        : NaN;
}